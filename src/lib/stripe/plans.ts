// ─── Plan definitions ─────────────────────────────────────────────────────────
// Single source of truth for plan IDs, limits, pricing, and features.
// Stripe price IDs are resolved from env vars at call-time so this file is
// safe to import from server, edge, and client contexts.
//
// PUBLIC plans (visible on /pricing, sign-up, upgrade UI): starter, professional
// HIDDEN plans (admin-granted only, never appear in marketing): petits_genies
//
// New users always start on a 14-day Starter trial; there is no free tier.

export type PlanId = 'starter' | 'professional' | 'petits_genies'

/** Plans shown publicly on /pricing and in upgrade flows. */
export const PUBLIC_PLAN_IDS: PlanId[] = ['starter', 'professional']

/** Plans that are never purchasable — granted by an admin only. */
export const HIDDEN_PLAN_IDS: PlanId[] = ['petits_genies']

/** Length of the auto-trial granted to every new signup. */
export const TRIAL_PERIOD_DAYS = 14

export interface PlanLimits {
  /** Maximum child profiles allowed. Infinity = unlimited. */
  childProfiles: number
  /** Maximum questions per day. Infinity = unlimited. */
  questionsPerDay: number
}

export interface PlanDefinition {
  id: PlanId
  name: string
  /** Monthly price in CAD. 0 for hidden grant plans. */
  priceCAD: number
  /** Stripe recurring price ID. Empty string = plan is not purchasable via Stripe. */
  stripePriceId: string
  limits: PlanLimits
  /** Human-readable feature list for the pricing UI. */
  features: string[]
  /** Whether this is the recommended / highlighted plan. */
  highlighted?: boolean
  /** Hidden plans never surface in public UI. */
  hidden?: boolean
  /** Optional short tagline shown under the plan name. */
  tagline?: string
}

export const PLANS: Record<PlanId, PlanDefinition> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    priceCAD: 29.99,
    get stripePriceId() {
      return process.env.STRIPE_PRICE_ID_STARTER ?? ''
    },
    limits: {
      childProfiles: 3,
      questionsPerDay: 15,
    },
    features: [
      '15 questions per day',
      'Up to 3 child profiles',
      'PubMed-grounded answers',
      'Full conversation history',
      '14-day free trial',
    ],
    tagline: 'For parents & caregivers',
  },

  professional: {
    id: 'professional',
    name: 'Professional',
    priceCAD: 99.99,
    get stripePriceId() {
      return process.env.STRIPE_PRICE_ID_PROFESSIONAL ?? ''
    },
    limits: {
      childProfiles: Infinity,
      questionsPerDay: 150,
    },
    features: [
      '150 questions per day',
      'Unlimited client profiles',
      'Client-oriented terminology',
      'Export conversations (PDF)',
      'Priority support',
      '14-day free trial',
    ],
    highlighted: true,
    tagline: 'For clinicians & teachers',
  },

  // ─── Hidden plans ────────────────────────────────────────────────────────────
  // petits_genies: granted by admin to families enrolled in the Petits Génies
  // clinic. Never appears on /pricing or in upgrade flows. Not purchasable.
  petits_genies: {
    id: 'petits_genies',
    name: 'Petits Génies Family Plan',
    priceCAD: 0,
    stripePriceId: '',
    limits: {
      childProfiles: 3,
      questionsPerDay: 5,
    },
    features: [
      '5 questions per day',
      'Up to 3 child profiles',
      'PubMed-grounded answers',
      'Full conversation history',
      'Provided by Petits Génies clinic',
    ],
    hidden: true,
    tagline: 'Clinic partnership',
  },
}

/** Returns the limits for a given plan ID. Falls back to starter limits if unknown. */
export function getPlanLimits(planId: string): PlanLimits {
  return PLANS[planId as PlanId]?.limits ?? PLANS.starter.limits
}

/** Returns the full plan definition. Falls back to starter plan if unknown. */
export function getPlanById(planId: string): PlanDefinition {
  return PLANS[planId as PlanId] ?? PLANS.starter
}

/**
 * Resolve a Stripe price ID to a plan ID.
 * Called in the webhook handler to determine which plan a subscription belongs to.
 */
export function getPlanIdFromPriceId(priceId: string): PlanId {
  if (priceId && priceId === process.env.STRIPE_PRICE_ID_STARTER)      return 'starter'
  if (priceId && priceId === process.env.STRIPE_PRICE_ID_PROFESSIONAL) return 'professional'
  return 'starter'
}

/** The set of valid Stripe price IDs (for validating checkout requests). */
export function getValidPriceIds(): string[] {
  return [
    process.env.STRIPE_PRICE_ID_STARTER ?? '',
    process.env.STRIPE_PRICE_ID_PROFESSIONAL ?? '',
  ].filter(Boolean)
}
