'use client'

import { useEffect, useState, useTransition } from 'react'
import { Zap, Crown, ArrowRight, X, Loader2 } from 'lucide-react'
import { createCheckoutSession } from '@/lib/actions/billing'
import { PLANS } from '@/lib/stripe/plans'
import type { PlanId } from '@/lib/types'

const PLAN_ICONS: Record<string, React.ReactNode> = {
  standard:     <Zap size={15} className="text-dblue-500" strokeWidth={2} />,
  professional: <Crown size={15} className="text-sage-600" strokeWidth={2} />,
}

/**
 * Shown on the dashboard when a user signed up via a paid plan CTA on the
 * pricing page. Reads the pending plan from localStorage and offers to start
 * the Stripe checkout flow immediately.
 */
export function PendingPlanBanner({ currentPlanId }: { currentPlanId: PlanId }) {
  const [pendingPlan, setPendingPlan] = useState<PlanId | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, startTransition] = useTransition()

  useEffect(() => {
    try {
      const stored = localStorage.getItem('devy_pending_plan') as PlanId | null
      // Only show if the pending plan is higher than their current plan
      const hierarchy = { free: 0, standard: 1, professional: 2 }
      if (
        stored &&
        stored in PLANS &&
        (hierarchy[stored] ?? 0) > (hierarchy[currentPlanId] ?? 0)
      ) {
        setPendingPlan(stored)
      } else if (stored) {
        // Already on this plan or higher — clear it
        localStorage.removeItem('devy_pending_plan')
      }
    } catch { /* ignore */ }
  }, [currentPlanId])

  if (!pendingPlan || dismissed) return null

  const plan = PLANS[pendingPlan]

  function dismiss() {
    setDismissed(true)
    try { localStorage.removeItem('devy_pending_plan') } catch { /* ignore */ }
  }

  function handleUpgrade() {
    setError(null)
    startTransition(async () => {
      const result = await createCheckoutSession(pendingPlan!)
      if (result.error) {
        setError(result.error)
        return
      }
      if (result.url) {
        localStorage.removeItem('devy_pending_plan')
        window.location.href = result.url
      }
    })
  }

  return (
    <div className="bg-white rounded-card-lg border border-sage-200 shadow-card overflow-hidden">
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="w-9 h-9 rounded-card bg-sage-100 flex items-center justify-center shrink-0">
          {PLAN_ICONS[pendingPlan]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-body-sm font-semibold text-ink">
            Complete your upgrade to {plan.name}
          </p>
          <p className="text-body-xs text-ink-secondary">
            ${plan.priceCAD} CAD/mo · {plan.features[0]} · {plan.features[1]}
          </p>
          {error && <p className="text-body-xs text-red-600 mt-1">{error}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-2 bg-sage-500 text-white text-body-xs font-semibold rounded-pill shadow-button hover:bg-sage-600 focus-ring active:scale-[0.98] disabled:opacity-60"
            style={{ transitionProperty: 'background-color, transform', transitionDuration: '150ms' }}
          >
            {isLoading ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <>
                Upgrade now
                <ArrowRight size={12} strokeWidth={2.5} />
              </>
            )}
          </button>
          <button
            onClick={dismiss}
            className="w-7 h-7 flex items-center justify-center rounded-card text-ink-tertiary hover:text-ink hover:bg-raised focus-ring"
            style={{ transitionProperty: 'background-color, color', transitionDuration: '150ms' }}
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
