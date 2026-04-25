'use server'

import { createClient as createServiceClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { updateUserRoleSchema, updateUserStatusSchema } from '@/lib/validation/schemas'
import type { Database } from '@/lib/supabase/database.types'
import type { User, UserRole, UserStatus, PlanId } from '@/lib/types'

export interface AdminAnalytics {
  // Subscription breakdown
  planCounts: { free: number; starter: number; pro: number; clinician: number; petits_genies: number }
  mrr: number // Monthly recurring revenue in CAD
  // Engagement
  totalConversations: number
  totalMessages: number
  questionsToday: number
  totalUsers: number
  // Knowledge base
  documentsReady: number
  totalChunks: number
  documentsByType: { pdf: number; docx: number; txt: number }
}

// ─── Authorization guard ──────────────────────────────────────────────────────

/**
 * Verifies the current session user is an admin.
 * Must be called at the start of every admin server action.
 * Returns an error string if not authorized, null if OK.
 */
async function requireAdmin(): Promise<{ error: string } | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { error: 'Forbidden' }
  return null
}

// ─── Service client (bypasses RLS) ───────────────────────────────────────────

/** Only used after requireAdmin() confirms the caller is an admin. */
function serviceClient() {
  return createServiceClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

// ─── Actions ──────────────────────────────────────────────────────────────────

/** Fetches platform-wide analytics. Admin-only. */
export async function getAnalytics(): Promise<AdminAnalytics | null> {
  const authErr = await requireAdmin()
  if (authErr) return null

  const supabase = serviceClient()

  const [
    subRows,
    convResult,
    msgResult,
    usageTodayResult,
    userCountResult,
    docResult,
  ] = await Promise.all([
    supabase.from('subscriptions').select('plan_id'),
    supabase.from('conversations').select('*', { count: 'exact', head: true }),
    supabase.from('messages').select('*', { count: 'exact', head: true }),
    supabase
      .from('daily_usage_log')
      .select('question_count')
      .eq('usage_date', new Date().toISOString().split('T')[0]),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('documents').select('status, file_type, chunk_count'),
  ])

  const plans = { free: 0, starter: 0, pro: 0, clinician: 0, petits_genies: 0 }
  for (const row of subRows.data ?? []) {
    const p = row.plan_id as keyof typeof plans
    if (p in plans) plans[p]++
  }

  // MRR uses plan price tables — petits_genies is $0 (sponsored), so it doesn't contribute.
  const { PLANS } = await import('@/lib/stripe/plans')
  const mrr =
    plans.starter   * PLANS.starter.priceCAD +
    plans.pro       * PLANS.pro.priceCAD +
    plans.clinician * PLANS.clinician.priceCAD

  const questionsToday = (usageTodayResult.data ?? []).reduce(
    (sum, r) => sum + (r.question_count ?? 0), 0
  )

  const docs = docResult.data ?? []
  const documentsReady = docs.filter(d => d.status === 'ready').length
  const totalChunks = docs.reduce((s, d) => s + (d.chunk_count ?? 0), 0)
  const documentsByType = { pdf: 0, docx: 0, txt: 0 }
  for (const d of docs) {
    const t = d.file_type as keyof typeof documentsByType
    if (t in documentsByType) documentsByType[t]++
  }

  return {
    planCounts: plans,
    mrr,
    totalConversations: convResult.count ?? 0,
    totalMessages: msgResult.count ?? 0,
    questionsToday,
    totalUsers: userCountResult.count ?? 0,
    documentsReady,
    totalChunks,
    documentsByType,
  }
}

export interface AdminUserDetail {
  user: User
  children: {
    id: string
    name: string
    dateOfBirth: string | null
    avatarColor: 'sage' | 'dblue' | 'sand'
    contextLabels: string[]
    supportNeeds: string[]
    createdAt: string
  }[]
  subscription: {
    planId: string
    status: string
    stripeCustomerId: string | null
    currentPeriodEnd: string | null
    cancelAtPeriodEnd: boolean
  } | null
  stats: {
    conversationCount: number
    messageCount: number
  }
}

/** Fetches full detail for a single user. Admin-only. */
export async function getUserDetail(userId: string): Promise<AdminUserDetail | null> {
  const authErr = await requireAdmin()
  if (authErr) return null

  const supabase = serviceClient()

  const [authResult, profileResult, childrenResult, subResult, convResult, msgResult] = await Promise.all([
    supabase.auth.admin.getUserById(userId),
    supabase.from('profiles').select('id, name, role, status').eq('id', userId).single(),
    supabase.from('children').select('id, name, date_of_birth, avatar_color, context_labels, support_needs, created_at').eq('user_id', userId).order('created_at'),
    supabase.from('subscriptions').select('plan_id, status, stripe_customer_id, current_period_end, cancel_at_period_end').eq('user_id', userId).single(),
    supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('messages').select('conversation_id').eq('role', 'user').in(
      'conversation_id',
      (await supabase.from('conversations').select('id').eq('user_id', userId)).data?.map(c => c.id) ?? []
    ),
  ])

  const au = authResult.data?.user
  const p = profileResult.data
  if (!au || !p) return null

  return {
    user: {
      id: au.id,
      name: p.name,
      email: au.email ?? '',
      role: p.role as UserRole,
      status: p.status as UserStatus,
      joinedAt: au.created_at,
      lastActiveAt: au.last_sign_in_at ?? au.created_at,
    },
    children: (childrenResult.data ?? []).map(c => ({
      id: c.id,
      name: c.name,
      dateOfBirth: c.date_of_birth,
      avatarColor: c.avatar_color as 'sage' | 'dblue' | 'sand',
      contextLabels: c.context_labels ?? [],
      supportNeeds: c.support_needs ?? [],
      createdAt: c.created_at,
    })),
    subscription: subResult.data
      ? {
          planId: subResult.data.plan_id,
          status: subResult.data.status,
          stripeCustomerId: subResult.data.stripe_customer_id,
          currentPeriodEnd: subResult.data.current_period_end,
          cancelAtPeriodEnd: subResult.data.cancel_at_period_end,
        }
      : null,
    stats: {
      conversationCount: convResult.count ?? 0,
      messageCount: msgResult.data?.length ?? 0,
    },
  }
}

/** Fetches all platform users. Admin-only. */
export async function getUsers(): Promise<User[]> {
  const authErr = await requireAdmin()
  if (authErr) return []

  const supabase = serviceClient()

  // Paginate to handle deployments with more than 1000 users.
  const allAuthUsers: (typeof authResult.data.users)[number][] = []
  let page = 1
  let authResult: Awaited<ReturnType<typeof supabase.auth.admin.listUsers>>
  do {
    authResult = await supabase.auth.admin.listUsers({ page, perPage: 1000 })
    allAuthUsers.push(...(authResult.data?.users ?? []))
    page++
  } while ((authResult.data?.users?.length ?? 0) === 1000)

  const [profilesResult, subsResult] = await Promise.all([
    supabase.from('profiles').select('id, name, role, status'),
    supabase.from('subscriptions').select('user_id, plan_id'),
  ])

  const authUsers = allAuthUsers
  const profiles = profilesResult.data ?? []
  const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]))
  const subMap = Object.fromEntries((subsResult.data ?? []).map(s => [s.user_id, s.plan_id]))

  return authUsers.map(au => {
    const p = profileMap[au.id]
    return {
      id: au.id,
      name: p?.name ?? (au.user_metadata?.name as string | undefined) ?? 'Unknown',
      email: au.email ?? '',
      role: ((p?.role ?? 'parent') as UserRole),
      status: ((p?.status ?? 'active') as UserStatus),
      planId: ((subMap[au.id] ?? 'free') as PlanId),
      joinedAt: au.created_at,
      lastActiveAt: au.last_sign_in_at ?? au.created_at,
    }
  })
}

/** Suspend or reactivate a user. Admin-only. */
export async function updateUserStatus(
  id: string,
  status: UserStatus,
): Promise<{ error?: string }> {
  const authErr = await requireAdmin()
  if (authErr) return authErr

  const parsed = updateUserStatusSchema.safeParse({ id, status })
  if (!parsed.success) return { error: 'Invalid input' }

  const supabase = serviceClient()
  const { error } = await supabase
    .from('profiles')
    .update({ status: parsed.data.status })
    .eq('id', parsed.data.id)

  if (error) return { error: 'Update failed' }
  revalidatePath('/admin/users')
  return {}
}

// ─── Sponsored / admin-granted plans ─────────────────────────────────────────

/**
 * Grant the Petits Génies Family Plan to a user.
 * Admin-only. The plan is never purchasable via Stripe — it's purely a DB flag.
 * If the user already has a Stripe subscription, this overrides it locally but does NOT cancel
 * their Stripe sub — the admin should either (a) ask them to cancel first or (b) handle the
 * existing Stripe sub via the billing portal. We warn via the returned `warning` field.
 */
export async function grantPetitsGeniesPlan(
  targetUserId: string,
): Promise<{ error?: string; warning?: string }> {
  const authErr = await requireAdmin()
  if (authErr) return authErr

  const supabase = createClient()
  const { data: { user: adminUser } } = await supabase.auth.getUser()
  if (!adminUser) return { error: 'Not authenticated' }

  const svc = serviceClient()

  // Check for an existing active Stripe subscription
  const { data: existing } = await svc
    .from('subscriptions')
    .select('stripe_subscription_id, status, plan_id')
    .eq('user_id', targetUserId)
    .single()

  const now = new Date().toISOString()

  const { error } = await svc
    .from('subscriptions')
    .upsert(
      {
        user_id: targetUserId,
        plan_id: 'petits_genies',
        status: 'active',
        plan_granted_by: adminUser.id,
        plan_granted_at: now,
        // Clear stripe subscription fields since this isn't a Stripe-backed plan
        stripe_subscription_id: null,
        stripe_price_id: null,
        current_period_start: null,
        current_period_end: null,
        cancel_at_period_end: false,
        updated_at: now,
      },
      { onConflict: 'user_id' },
    )

  if (error) return { error: 'Failed to grant plan' }

  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${targetUserId}`)

  if (existing?.stripe_subscription_id && existing.status === 'active') {
    return {
      warning: 'User had an active Stripe subscription. The sponsored plan now applies, but the Stripe subscription is still active — cancel it via the Stripe dashboard or ask the user to cancel.',
    }
  }
  return {}
}

/**
 * Revoke a sponsored plan (e.g. Petits Génies) and revert the user to Free.
 * Does not affect Stripe subscriptions.
 */
export async function revokeSponsoredPlan(
  targetUserId: string,
): Promise<{ error?: string }> {
  const authErr = await requireAdmin()
  if (authErr) return authErr

  const svc = serviceClient()

  const { data: existing } = await svc
    .from('subscriptions')
    .select('plan_id')
    .eq('user_id', targetUserId)
    .single()

  if (!existing || existing.plan_id !== 'petits_genies') {
    return { error: 'User is not on a sponsored plan' }
  }

  const { error } = await svc
    .from('subscriptions')
    .update({
      plan_id: 'free',
      status: 'canceled',
      plan_granted_by: null,
      plan_granted_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', targetUserId)

  if (error) return { error: 'Failed to revoke plan' }

  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${targetUserId}`)
  return {}
}

/** Change a user's role. Admin-only. */
export async function updateUserRole(
  id: string,
  role: UserRole,
): Promise<{ error?: string }> {
  const authErr = await requireAdmin()
  if (authErr) return authErr

  const parsed = updateUserRoleSchema.safeParse({ id, role })
  if (!parsed.success) return { error: 'Invalid input' }

  const supabase = serviceClient()
  const { error } = await supabase
    .from('profiles')
    .update({ role: parsed.data.role })
    .eq('id', parsed.data.id)

  if (error) return { error: 'Update failed' }
  revalidatePath('/admin/users')
  return {}
}
