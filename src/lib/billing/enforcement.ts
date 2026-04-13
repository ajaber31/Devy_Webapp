// ─── Plan enforcement helpers ─────────────────────────────────────────────────
// Used by both server actions (createChild) and API routes (/api/chat).
// All checks are server-side — the frontend reflects results, not enforces them.

import { createClient } from '@/lib/supabase/server'
import { getPlanLimits } from '@/lib/stripe/plans'

export type LimitCode = 'PROFILE_LIMIT_REACHED' | 'DAILY_LIMIT_REACHED'

export interface LimitCheckResult {
  allowed: boolean
  current: number
  /** Maximum allowed. -1 = unlimited. */
  limit: number
  planId: string
  code?: LimitCode
}

/**
 * Check whether a user can create an additional child profile.
 * Runs two parallel queries: one for the subscription plan, one for the child count.
 */
export async function checkChildProfileLimit(userId: string): Promise<LimitCheckResult> {
  const supabase = createClient()

  const [subResult, countResult] = await Promise.all([
    supabase
      .from('subscriptions')
      .select('plan_id')
      .eq('user_id', userId)
      .single(),
    supabase
      .from('children')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId),
  ])

  const planId = subResult.data?.plan_id ?? 'free'
  const limits = getPlanLimits(planId)
  const current = countResult.count ?? 0

  // Unlimited plan
  if (limits.childProfiles === Infinity) {
    return { allowed: true, current, limit: -1, planId }
  }

  if (current >= limits.childProfiles) {
    return {
      allowed: false,
      current,
      limit: limits.childProfiles,
      planId,
      code: 'PROFILE_LIMIT_REACHED',
    }
  }

  return { allowed: true, current, limit: limits.childProfiles, planId }
}

/**
 * Check whether a user can send another question today.
 * Reads the subscription plan and calls the get_daily_usage Postgres function.
 */
export async function checkDailyQuestionLimit(userId: string): Promise<LimitCheckResult> {
  const supabase = createClient()

  const { data: subData } = await supabase
    .from('subscriptions')
    .select('plan_id')
    .eq('user_id', userId)
    .single()

  const planId = subData?.plan_id ?? 'free'
  const limits = getPlanLimits(planId)

  // Unlimited plan — skip the usage query
  if (limits.questionsPerDay === Infinity) {
    return { allowed: true, current: 0, limit: -1, planId }
  }

  const { data: usageCount } = await supabase
    .rpc('get_daily_usage', { p_user_id: userId })

  const current = (usageCount as number | null) ?? 0

  if (current >= limits.questionsPerDay) {
    return {
      allowed: false,
      current,
      limit: limits.questionsPerDay,
      planId,
      code: 'DAILY_LIMIT_REACHED',
    }
  }

  return { allowed: true, current, limit: limits.questionsPerDay, planId }
}
