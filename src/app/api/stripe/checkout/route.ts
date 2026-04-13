import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { getStripe } from '@/lib/stripe/client'
import { getValidPriceIds } from '@/lib/stripe/plans'
import type { Database } from '@/lib/supabase/database.types'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  // ── Auth ───────────────────────────────────────────────────────────────────
  const cookieStore = await cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // ── Validate price ID ──────────────────────────────────────────────────────
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { priceId } = body as { priceId?: string }
  const validPriceIds = getValidPriceIds()

  if (!priceId || !validPriceIds.includes(priceId)) {
    return NextResponse.json({ error: 'Invalid price ID' }, { status: 400 })
  }

  // ── Look up or create Stripe customer ──────────────────────────────────────
  const { data: subData } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  let stripeCustomerId = subData?.stripe_customer_id ?? null

  const stripe = getStripe()

  if (!stripeCustomerId) {
    // Create a new Stripe customer
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

    // Persist the customer ID using service role (user cannot write to subscriptions)
    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    await supabaseAdmin
      .from('subscriptions')
      .upsert(
        { user_id: user.id, stripe_customer_id: stripeCustomerId, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' },
      )
  }

  // ── Create Checkout session ────────────────────────────────────────────────
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: 'subscription',
    currency: 'cad',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${siteUrl}/settings?tab=billing&checkout=success`,
    cancel_url: `${siteUrl}/pricing`,
    allow_promotion_codes: true,
    // userId is stored in subscription metadata so the webhook can resolve it
    subscription_data: {
      metadata: { userId: user.id },
    },
    metadata: { userId: user.id },
  })

  return NextResponse.json({ url: session.url })
}
