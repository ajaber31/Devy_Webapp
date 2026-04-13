// ─── Plan definitions ─────────────────────────────────────────────────────────
// Single source of truth for all plan IDs, limits, pricing, and features.
// Stripe price IDs are resolved from env vars at call-time (never at module load)
// so this file is safe to import in both server and edge contexts.

export type PlanId = 'free' | 'standard' | 'professional'

export interface PlanLimits {
  /** Maximum child profiles allowed. Infinity = unlimited. */
  childProfiles: number
  /** Maximum questions per day. Infinity = unlimited. */
  questionsPerDay: number
}

export interface PlanDefinition {
  id: PlanId
  name: string
  /** Monthly price in CAD. 0 for free. */
  priceCAD: number
  /** Stripe recurring price ID. Empty string for free plan. */
  stripePriceId: string
  limits: PlanLimits
  /** Human-readable feature list for the pricing UI. */
  features: string[]
  /** Whether this is the recommended / highlighted plan. */
  highlighted?: boolean
}

export const PLANS: Record<PlanId, PlanDefinition> = {
  free: {
    id: 'free',
    name: 'Free',
    priceCAD: 0,
    stripePriceId: '',
    limits: {
      childProfiles: 0,
      questionsPerDay: 5,
    },
    features: [
      '5 questions per day',
      'Evidence-based AI answers',
      'PubMed-grounded responses',
      'Access to knowledge base',
    ],
  },

  standard: {
    id: 'standard',
    name: 'Standard',
    priceCAD: 15,
    get stripePriceId() {
      return process.env.STRIPE_PRICE_ID_STANDARD ?? ''
    },
    limits: {
      childProfiles: 2,
      questionsPerDay: 20,
    },
    features: [
      '20 questions per day',
      'Up to 2 child profiles',
      'Child-context-aware answers',
      'Full conversation history',
      'Everything in Free',
    ],
    highlighted: true,
  },

  professional: {
    id: 'professional',
    name: 'Professional',
    priceCAD: 50,
    get stripePriceId() {
      return process.env.STRIPE_PRICE_ID_PROFESSIONAL ?? ''
    },
    limits: {
      childProfiles: Infinity,
      questionsPerDay: Infinity,
    },
    features: [
      'Unlimited questions per day',
      'Unlimited child profiles',
      'Child-context-aware answers',
      'Full conversation history',
      'Priority support',
      'Everything in Standard',
    ],
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
  if (priceId && priceId === process.env.STRIPE_PRICE_ID_STANDARD) return 'standard'
  if (priceId && priceId === process.env.STRIPE_PRICE_ID_PROFESSIONAL) return 'professional'
  return 'free'
}

/** The set of valid Stripe price IDs (for validating checkout requests). */
export function getValidPriceIds(): string[] {
  return [
    process.env.STRIPE_PRICE_ID_STANDARD ?? '',
    process.env.STRIPE_PRICE_ID_PROFESSIONAL ?? '',
  ].filter(Boolean)
}
