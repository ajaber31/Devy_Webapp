import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getStripe } from '@/lib/stripe/client'
import { getPlanIdFromPriceId, PLANS } from '@/lib/stripe/plans'
import { getResend, FROM_EMAIL } from '@/lib/email/client'
import {
  subscriptionConfirmedEmail,
  paymentFailedEmail,
  subscriptionCanceledEmail,
} from '@/lib/email/templates'
import type Stripe from 'stripe'

// Must run in Node.js — Stripe webhook verification uses Node crypto
export const runtime = 'nodejs'

// Service-role Supabase client (bypasses RLS).
// Used here because the webhook has no user session cookie.
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

// ─── Email helper ─────────────────────────────────────────────────────────────

/**
 * Look up the user's email + display name from Supabase Auth + profiles,
 * then fire-and-forget an email. Silently skips if Resend isn't configured.
 */
async function sendEmail(
  userId: string,
  subject: string,
  html: string,
): Promise<void> {
  const resend = getResend()
  if (!resend) return // RESEND_API_KEY not set — skip silently

  const supabase = getSupabaseAdmin()
  const { data: authUser } = await supabase.auth.admin.getUserById(userId)
  const email = authUser?.user?.email
  if (!email) return

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject,
    html,
  }).catch((err: unknown) => {
    console.error('[webhook] Email send failed:', err)
  })
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * In the Stripe dahlia API, period dates live on the SubscriptionItem, not the Subscription.
 * This helper extracts them safely.
 */
function getSubscriptionPeriod(subscription: Stripe.Subscription): {
  periodStart: string | null
  periodEnd: string | null
} {
  const item = subscription.items.data[0]
  return {
    periodStart: item?.current_period_start
      ? new Date(item.current_period_start * 1000).toISOString()
      : null,
    periodEnd: item?.current_period_end
      ? new Date(item.current_period_end * 1000).toISOString()
      : null,
  }
}

// ─── Subscription upsert ──────────────────────────────────────────────────────

async function upsertSubscription(
  subscription: Stripe.Subscription,
  userId: string,
) {
  const supabase = getSupabaseAdmin()
  const priceId = subscription.items.data[0]?.price.id ?? ''
  const { periodStart, periodEnd } = getSubscriptionPeriod(subscription)

  await supabase
    .from('subscriptions')
    .upsert(
      {
        user_id: userId,
        stripe_customer_id: subscription.customer as string,
        stripe_subscription_id: subscription.id,
        stripe_price_id: priceId,
        plan_id: getPlanIdFromPriceId(priceId),
        status: subscription.status,
        current_period_start: periodStart,
        current_period_end: periodEnd,
        cancel_at_period_end: subscription.cancel_at_period_end,
        canceled_at: subscription.canceled_at
          ? new Date(subscription.canceled_at * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
}

// ─── Event handlers ───────────────────────────────────────────────────────────

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId
  if (!userId) {
    console.error('[webhook] subscription.created: missing userId in metadata', subscription.id)
    return
  }
  await upsertSubscription(subscription, userId)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId
  if (!userId) {
    console.error('[webhook] subscription.updated: missing userId in metadata', subscription.id)
    return
  }
  await upsertSubscription(subscription, userId)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId
  if (!userId) {
    console.error('[webhook] subscription.deleted: missing userId in metadata', subscription.id)
    return
  }

  const supabase = getSupabaseAdmin()
  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', userId)
    .single()

  // Look up the plan name from the price that was active before deletion
  const priceId = subscription.items.data[0]?.price.id ?? ''
  const planId = getPlanIdFromPriceId(priceId)
  const planName = PLANS[planId]?.name ?? 'paid'

  // Revert to free plan; keep the row so we retain the stripe_customer_id
  await supabase
    .from('subscriptions')
    .upsert(
      {
        user_id: userId,
        plan_id: 'free',
        status: 'canceled',
        stripe_subscription_id: null,
        stripe_price_id: null,
        current_period_start: null,
        current_period_end: null,
        cancel_at_period_end: false,
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )

  // Fire-and-forget cancellation email
  void sendEmail(
    userId,
    `Your ${planName} subscription has ended`,
    subscriptionCanceledEmail({
      name: profile?.name ?? 'there',
      planName,
      canceledAt: new Date().toISOString(),
    }),
  )
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  // Only handle subscription checkout sessions
  if (session.mode !== 'subscription') return

  const subscriptionId = session.subscription as string
  if (!subscriptionId) return

  const stripe = getStripe()

  // Fetch the full subscription object to get metadata + item period dates
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['items'],
  })
  const userId = subscription.metadata?.userId ?? session.metadata?.userId

  if (!userId) {
    console.error('[webhook] checkout.session.completed: missing userId', session.id)
    return
  }

  await upsertSubscription(subscription, userId)

  // Send subscription confirmed email
  const priceId = subscription.items.data[0]?.price.id ?? ''
  const planId = getPlanIdFromPriceId(priceId)
  const plan = PLANS[planId]
  const { periodEnd } = getSubscriptionPeriod(subscription)

  const { data: profile } = await getSupabaseAdmin()
    .from('profiles')
    .select('name')
    .eq('id', userId)
    .single()

  void sendEmail(
    userId,
    `You're on ${plan?.name ?? 'Devy'} — subscription confirmed`,
    subscriptionConfirmedEmail({
      name: profile?.name ?? 'there',
      planName: plan?.name ?? 'Paid',
      priceCAD: plan?.priceCAD ?? 0,
      periodEnd,
    }),
  )
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // In dahlia API, subscription ID is on invoice.parent.subscription_details?.subscription
  const parentSub = invoice.parent?.subscription_details?.subscription
  const subscriptionId = typeof parentSub === 'string' ? parentSub : parentSub?.id
  if (!subscriptionId) return

  const stripe = getStripe()
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['items'],
  })
  const userId = subscription.metadata?.userId
  if (!userId) return

  // Refresh period dates on successful renewal
  await upsertSubscription(subscription, userId)
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const parentSub = invoice.parent?.subscription_details?.subscription
  const subscriptionId = typeof parentSub === 'string' ? parentSub : parentSub?.id
  if (!subscriptionId) return

  const stripe = getStripe()
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const userId = subscription.metadata?.userId
  if (!userId) return

  const supabase = getSupabaseAdmin()

  await supabase
    .from('subscriptions')
    .update({ status: 'past_due', updated_at: new Date().toISOString() })
    .eq('user_id', userId)

  // Send payment failed email
  const priceId = subscription.items.data[0]?.price.id ?? ''
  const planId = getPlanIdFromPriceId(priceId)
  const planName = PLANS[planId]?.name ?? 'paid'

  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', userId)
    .single()

  void sendEmail(
    userId,
    'Payment failed — action required',
    paymentFailedEmail({
      name: profile?.name ?? 'there',
      planName,
    }),
  )
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET is not configured')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[webhook] Signature verification failed:', msg)
    return NextResponse.json({ error: `Webhook signature error: ${msg}` }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break
      default:
        // Unhandled event — return 200 to prevent Stripe retries
        break
    }
  } catch (err) {
    // Log but still return 200 — avoid Stripe retry storms for transient errors
    console.error('[webhook] Handler error for', event.type, err)
  }

  return NextResponse.json({ received: true })
}
