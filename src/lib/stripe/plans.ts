// ─── Plan definitions ─────────────────────────────────────────────────────────
// Single source of truth for all plan IDs, limits, pricing, and features.
// Stripe price IDs are resolved from env vars at call-time (never at module load)
// so this file is safe to import in both server and edge contexts.
//
// PUBLIC plans (visible on /pricing, sign-up, upgrade UI): free, starter, pro, clinician
// HIDDEN plans (admin-granted only, never appear in marketing): petits_genies

export type PlanId = 'free' | 'starter' | 'pro' | 'clinician' | 'petits_genies'

/** Plans shown publicly on /pricing and in upgrade flows. */
export const PUBLIC_PLAN_IDS: PlanId[] = ['free', 'starter', 'pro', 'clinician']

/** Plans that are never purchasable — granted by an admin only. */
export const HIDDEN_PLAN_IDS: PlanId[] = ['petits_genies']

export interface PlanLimits {
  /** Maximum child profiles allowed. Infinity = unlimited. */
  childProfiles: number
  /** Maximum questions per day. Infinity = unlimited. */
  questionsPerDay: number
}

export interface PlanDefinition {
  id: PlanId
  name: string
  /** Monthly price in CAD. 0 for free / hidden grant plans. */
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
  free: {
    id: 'free',
    name: 'Free',
    priceCAD: 0,
    stripePriceId: '',
    limits: {
      childProfiles: 0,
      questionsPerDay: 3,
    },
    features: [
      '3 questions per day',
      'Evidence-based AI answers',
      'Access to knowledge base',
      'Child profiles available on paid plans',
    ],
    tagline: 'Try Devy, no credit card',
  },

  starter: {
    id: 'starter',
    name: 'Starter',
    priceCAD: 14,
    get stripePriceId() {
      return process.env.STRIPE_PRICE_ID_STARTER ?? ''
    },
    limits: {
      childProfiles: 3,
      questionsPerDay: 10,
    },
    features: [
      '10 questions per day',
      'Up to 3 child profiles',
      'PubMed-grounded answers',
      'Full conversation history',
      'Everything in Free',
    ],
    tagline: 'For parents & caregivers',
  },

  pro: {
    id: 'pro',
    name: 'Pro',
    priceCAD: 24,
    get stripePriceId() {
      return process.env.STRIPE_PRICE_ID_PRO ?? ''
    },
    limits: {
      childProfiles: Infinity,
      questionsPerDay: 50,
    },
    features: [
      '50 questions per day',
      'Unlimited child profiles',
      'Priority response speed',
      'Export conversations (PDF)',
      'Everything in Starter',
    ],
    highlighted: true,
    tagline: 'Most popular',
  },

  clinician: {
    id: 'clinician',
    name: 'Clinician',
    priceCAD: 39,
    get stripePriceId() {
      return process.env.STRIPE_PRICE_ID_CLINICIAN ?? ''
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
      'Everything in Pro',
    ],
    tagline: 'For clinicians & teachers',
  },

  // ─── Hidden plans ────────────────────────────────────────────────────────────
  // petits_genies: granted by admin to families enrolled in the Petits Génies
  // clinic. Never appears on /pricing or in upgrade flows. Not purchasable.
  petits_genies: {
    id: 'petits_genies',
    name: 'Petits Génies Family Plan',
    priceCAD: 0,
    stripePriceId: '', // intentionally not a Stripe plan
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

/** Returns the limits for a given plan ID. Falls back to free limits if unknown. */
export function getPlanLimits(planId: string): PlanLimits {
  return PLANS[planId as PlanId]?.limits ?? PLANS.free.limits
}

/** Returns the full plan definition. Falls back to free plan if unknown. */
export function getPlanById(planId: string): PlanDefinition {
  return PLANS[planId as PlanId] ?? PLANS.free
}

/**
 * Resolve a Stripe price ID to a plan ID.
 * Called in the webhook handler to determine which plan a subscription belongs to.
 */
export function getPlanIdFromPriceId(priceId: string): PlanId {
  if (priceId && priceId === process.env.STRIPE_PRICE_ID_STARTER)   return 'starter'
  if (priceId && priceId === process.env.STRIPE_PRICE_ID_PRO)       return 'pro'
  if (priceId && priceId === process.env.STRIPE_PRICE_ID_CLINICIAN) return 'clinician'
  return 'free'
}

/** The set of valid Stripe price IDs (for validating checkout requests). */
export function getValidPriceIds(): string[] {
  return [
    process.env.STRIPE_PRICE_ID_STARTER ?? '',
    process.env.STRIPE_PRICE_ID_PRO ?? '',
    process.env.STRIPE_PRICE_ID_CLINICIAN ?? '',
  ].filter(Boolean)
}
