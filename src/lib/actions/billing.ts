'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { getStripe } from '@/lib/stripe/client'
import { PLANS, getPlanLimits, getValidPriceIds } from '@/lib/stripe/plans'
import type { BillingStatus, PlanId, SubscriptionStatus } from '@/lib/types'

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * Fetch the full billing status for the currently authenticated user.
 * Used in server components (Settings, Children page) for SSR.
 * Returns null if the user is not authenticated.
 */
export async function getBillingStatus(): Promise<BillingStatus | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Parallel fetch: subscription row + today's usage count + child count
  const [subResult, usageResult, childCountResult] = await Promise.all([
    supabase
      .from('subscriptions')
      .select('plan_id, status, stripe_customer_id, stripe_subscription_id, current_period_end, cancel_at_period_end')
      .eq('user_id', user.id)
      .single(),
    supabase.rpc('get_daily_usage', { p_user_id: user.id }),
    supabase
      .from('children')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id),
  ])

  const sub = subResult.data
  const planId = (sub?.plan_id ?? 'free') as PlanId
  const limits = getPlanLimits(planId)

  return {
    planId,
    status: (sub?.status ?? 'active') as SubscriptionStatus,
    stripeCustomerId: sub?.stripe_customer_id ?? null,
    stripeSubscriptionId: sub?.stripe_subscription_id ?? null,
    currentPeriodEnd: sub?.current_period_end ?? null,
    cancelAtPeriodEnd: sub?.cancel_at_period_end ?? false,
    questionsToday: (usageResult.data as number | null) ?? 0,
    questionLimit: limits.questionsPerDay === Infinity ? -1 : limits.questionsPerDay,
    childCount: childCountResult.count ?? 0,
    childLimit: limits.childProfiles === Infinity ? -1 : limits.childProfiles,
  }
}

// ─── Checkout ─────────────────────────────────────────────────────────────────

/**
 * Initiate a Stripe Checkout session for a given plan ID ('standard' | 'professional').
 * The price ID is resolved server-side from env vars — never exposed to the browser.
 * Returns the Stripe-hosted checkout URL. The client does window.location.href = url.
 */
export async function createCheckoutSession(
  planId: PlanId,
): Promise<{ url?: string; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Resolve the Stripe price ID server-side (env vars only available here)
  const planDef = PLANS[planId]
  const priceId = planDef?.stripePriceId ?? ''
  const validPriceIds = getValidPriceIds()
  if (!priceId || !validPriceIds.includes(priceId)) {
    return { error: 'Invalid plan selected' }
  }

  // Look up existing Stripe customer ID
  const { data: subData } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  let stripeCustomerId = subData?.stripe_customer_id ?? null

  const stripe = getStripe()

  if (!stripeCustomerId) {
    // Fetch the user's display name for the customer record
    const { data: profileData } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single()

    const customer = await stripe.customers.create({
      email: user.email,
      name: profileData?.name ?? undefined,
      metadata: { userId: user.id },
    })

    stripeCustomerId = customer.id

    // Persist customer ID via service role (user cannot write to subscriptions table)
    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    await supabaseAdmin
      .from('subscriptions')
      .upsert(
        {
          user_id: user.id,
          stripe_customer_id: stripeCustomerId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      )
  }

  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      currency: 'cad',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/settings?tab=billing&checkout=success`,
      cancel_url: `${siteUrl}/pricing`,
      allow_promotion_codes: true,
      // userId in subscription metadata is how the webhook resolves who subscribed
      subscription_data: {
        metadata: { userId: user.id },
      },
      metadata: { userId: user.id },
    })

    return { url: session.url ?? undefined }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[billing] createCheckoutSession error:', msg)
    return { error: 'Failed to create checkout session. Please try again.' }
  }
}

// ─── Portal ───────────────────────────────────────────────────────────────────

/**
 * Create a Stripe Customer Portal session so the user can manage their subscription
 * (upgrade, downgrade, cancel, update payment method).
 * Returns the portal URL. The client does window.location.href = url.
 */
export async function createPortalSession(): Promise<{ url?: string; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: subData } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  const stripeCustomerId = subData?.stripe_customer_id

  if (!stripeCustomerId) {
    return { error: 'No billing account found. Please subscribe to a plan first.' }
  }

  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

    const session = await getStripe().billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${siteUrl}/settings?tab=billing`,
    })

    return { url: session.url }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[billing] createPortalSession error:', msg)
    return { error: 'Failed to open billing portal. Please try again.' }
  }
}
