import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getStripe } from '@/lib/stripe/client'
import type { Database } from '@/lib/supabase/database.types'

export const runtime = 'nodejs'

export async function POST() {
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

  // ── Look up Stripe customer ────────────────────────────────────────────────
  const { data: subData } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  const stripeCustomerId = subData?.stripe_customer_id

  if (!stripeCustomerId) {
    return NextResponse.json(
      { error: 'No billing account found. Please subscribe first.' },
      { status: 400 },
    )
  }

  // ── Create Customer Portal session ─────────────────────────────────────────
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const session = await getStripe().billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${siteUrl}/settings?tab=billing`,
  })

  return NextResponse.json({ url: session.url })
}
