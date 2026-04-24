'use client'

import { useTransition, useState } from 'react'
import { X, CheckCircle2, ArrowRight, Zap, Crown, Stethoscope, Loader2, AlertCircle } from 'lucide-react'
import { createCheckoutSession } from '@/lib/actions/billing'
import { useLanguage } from '@/components/shared/LanguageProvider'
import { PLANS } from '@/lib/stripe/plans'
import { cn } from '@/lib/utils'
import type { PlanId } from '@/lib/types'

interface UpgradeModalProps {
  open: boolean
  onClose: () => void
  reason: 'child_limit' | 'daily_limit'
  currentPlanId: PlanId
}

const ICON_FOR_PLAN: Record<PlanId, React.ReactNode> = {
  free:          null,
  starter:       <Zap size={14} className="text-dblue-500" strokeWidth={2} />,
  pro:           <Crown size={14} className="text-sage-600" strokeWidth={2} />,
  clinician:     <Stethoscope size={14} className="text-sand-600" strokeWidth={2} />,
  petits_genies: null,
}

/**
 * Returns the next 2 plans above the user's current plan, skipping hidden/sponsored ones.
 * Used to decide which plans to show as upgrade options in the modal.
 */
function getUpgradeOptions(currentPlanId: PlanId): PlanId[] {
  const order: PlanId[] = ['free', 'starter', 'pro', 'clinician']
  const currentIndex = order.indexOf(currentPlanId)
  // petits_genies users see Pro + Clinician as upgrade options (treat as below Starter)
  const effectiveIndex = currentIndex >= 0 ? currentIndex : 0
  return order.slice(effectiveIndex + 1, effectiveIndex + 3)
}

export function UpgradeModal({ open, onClose, reason, currentPlanId }: UpgradeModalProps) {
  const { t } = useLanguage()
  const um = t.upgradeModal
  const [error, setError] = useState<string | null>(null)
  const [isLoading, startTransition] = useTransition()

  if (!open) return null

  const copy = reason === 'child_limit'
    ? { title: um.childLimitTitle, description: um.childLimitDesc }
    : { title: um.dailyLimitTitle,  description: um.dailyLimitDesc }
  const options = getUpgradeOptions(currentPlanId)

  // Prefer showing at least 2 options. If user is already on Clinician, show Pro + Clinician (re-selection).
  const plansToShow: PlanId[] = options.length >= 2
    ? options
    : options.length === 1
      ? options
      : (['pro', 'clinician'] as PlanId[])

  function handleUpgrade(planId: PlanId) {
    setError(null)
    startTransition(async () => {
      const result = await createCheckoutSession(planId)
      if (result.error) {
        setError(result.error)
        return
      }
      if (result.url) {
        window.location.href = result.url
      }
    })
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-ink/30 z-40 backdrop-blur-sm"
        onClick={onClose}
        style={{ transitionProperty: 'opacity', transitionDuration: '150ms' }}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-card-lg shadow-floating border border-border/50 w-full max-w-xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="font-display text-display-sm font-semibold text-ink">
              {copy.title}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-card text-ink-tertiary hover:text-ink hover:bg-raised focus-ring"
              style={{ transitionProperty: 'background-color, color', transitionDuration: '150ms' }}
              aria-label={t.common.close}
            >
              <X size={16} />
            </button>
          </div>

          <div className="px-6 py-5 space-y-5">
            <p className="text-body-sm text-ink-secondary">{copy.description}</p>

            {error && (
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-card">
                <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-body-xs text-red-700">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {plansToShow.map((planId) => {
                const plan = PLANS[planId]
                const isCurrent = planId === currentPlanId
                const isHighlighted = !!plan.highlighted

                return (
                  <div
                    key={planId}
                    className={cn(
                      'relative rounded-card-lg border p-5 flex flex-col gap-4',
                      isHighlighted
                        ? 'border-sage-400 bg-sage-50'
                        : 'border-border bg-surface',
                    )}
                  >
                    {isHighlighted && (
                      <div className="absolute -top-3 left-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-sage-500 text-white text-body-xs font-semibold rounded-pill">
                          <Crown size={10} strokeWidth={2.5} />
                          {um.bestValue}
                        </span>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {ICON_FOR_PLAN[planId]}
                        <h4 className="font-display font-semibold text-ink">{plan.name}</h4>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-display-sm font-bold text-ink">${plan.priceCAD}</span>
                        <span className="text-body-xs text-ink-tertiary">CAD/mo</span>
                      </div>
                    </div>

                    <ul className="space-y-1.5 flex-1">
                      {plan.features.slice(0, 4).map((f) => (
                        <li key={f} className="flex items-start gap-2 text-body-xs text-ink-secondary">
                          <CheckCircle2 size={12} className="text-sage-500 mt-0.5 shrink-0" strokeWidth={2} />
                          {f}
                        </li>
                      ))}
                    </ul>

                    {!isCurrent && (
                      <button
                        onClick={() => handleUpgrade(planId)}
                        disabled={isLoading}
                        className={cn(
                          'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-card text-body-sm font-semibold focus-ring active:scale-[0.98] disabled:opacity-60',
                          isHighlighted
                            ? 'bg-sage-500 text-white shadow-button hover:bg-sage-600'
                            : 'bg-white border border-border text-ink hover:bg-raised',
                        )}
                        style={{ transitionProperty: 'background-color, transform', transitionDuration: '150ms' }}
                      >
                        {isLoading ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <>
                            {um.upgradeTo.replace('{plan}', plan.name)}
                            <ArrowRight size={13} strokeWidth={2.5} />
                          </>
                        )}
                      </button>
                    )}
                    {isCurrent && (
                      <div className="text-body-xs text-center text-ink-tertiary py-1">{um.currentPlan}</div>
                    )}
                  </div>
                )
              })}
            </div>

            <p className="text-body-xs text-ink-tertiary text-center">
              {um.footerNote}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
