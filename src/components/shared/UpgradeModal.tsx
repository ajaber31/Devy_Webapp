'use client'

import { useTransition } from 'react'
import { X, CheckCircle2, ArrowRight, Zap, Crown, Loader2, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { createCheckoutSession } from '@/lib/actions/billing'
import { PLANS } from '@/lib/stripe/plans'
import { cn } from '@/lib/utils'
import type { PlanId } from '@/lib/types'

interface UpgradeModalProps {
  open: boolean
  onClose: () => void
  reason: 'child_limit' | 'daily_limit'
  currentPlanId: PlanId
}

const REASON_COPY = {
  child_limit: {
    title: 'Add more child profiles',
    description: 'Your current plan doesn\'t include child profiles. Upgrade to start building personalized profiles and get context-aware support.',
  },
  daily_limit: {
    title: 'You\'ve reached your question limit',
    description: 'You\'ve used all your questions for today. Upgrade to ask more questions and get the support you need — without waiting until tomorrow.',
  },
}

export function UpgradeModal({ open, onClose, reason, currentPlanId }: UpgradeModalProps) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, startTransition] = useTransition()

  if (!open) return null

  const copy = REASON_COPY[reason]

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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/30 z-40 backdrop-blur-sm"
        onClick={onClose}
        style={{ transitionProperty: 'opacity', transitionDuration: '150ms' }}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-card-lg shadow-floating border border-border/50 w-full max-w-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div>
              <h2 className="font-display text-display-sm font-semibold text-ink">
                {copy.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-card text-ink-tertiary hover:text-ink hover:bg-raised focus-ring"
              style={{ transitionProperty: 'background-color, color', transitionDuration: '150ms' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-5">
            <p className="text-body-sm text-ink-secondary">{copy.description}</p>

            {error && (
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-card">
                <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-body-xs text-red-700">{error}</p>
              </div>
            )}

            {/* Plan cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(['standard', 'professional'] as PlanId[]).map((planId) => {
                const plan = PLANS[planId]
                const isCurrent = planId === currentPlanId

                return (
                  <div
                    key={planId}
                    className={cn(
                      'relative rounded-card-lg border p-5 flex flex-col gap-4',
                      planId === 'professional'
                        ? 'border-sage-400 bg-sage-50'
                        : 'border-border bg-surface',
                    )}
                  >
                    {planId === 'professional' && (
                      <div className="absolute -top-3 left-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-sage-500 text-white text-body-xs font-semibold rounded-pill">
                          <Crown size={10} strokeWidth={2.5} />
                          Best value
                        </span>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {planId === 'professional' ? (
                          <Crown size={15} className="text-sage-600" />
                        ) : (
                          <Zap size={15} className="text-dblue-500" />
                        )}
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
                          'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-card text-body-sm font-semibold focus-ring active:scale-[0.98]',
                          planId === 'professional'
                            ? 'bg-sage-500 text-white shadow-button hover:bg-sage-600'
                            : 'bg-white border border-border text-ink hover:bg-raised',
                        )}
                        style={{ transitionProperty: 'background-color, transform', transitionDuration: '150ms' }}
                      >
                        {isLoading ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <>
                            Upgrade to {plan.name}
                            <ArrowRight size={13} strokeWidth={2.5} />
                          </>
                        )}
                      </button>
                    )}
                    {isCurrent && (
                      <div className="text-body-xs text-center text-ink-tertiary py-1">Current plan</div>
                    )}
                  </div>
                )
              })}
            </div>

            <p className="text-body-xs text-ink-tertiary text-center">
              Cancel anytime · Secure payment via Stripe · Prices in CAD
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
