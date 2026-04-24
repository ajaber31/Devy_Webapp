'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  CreditCard, Zap, Users, CheckCircle2, AlertCircle,
  Clock, ArrowRight, ExternalLink, Loader2, Crown, Stethoscope, Sparkles,
} from 'lucide-react'
import { createCheckoutSession, createPortalSession } from '@/lib/actions/billing'
import { PLANS, PUBLIC_PLAN_IDS } from '@/lib/stripe/plans'
import { cn } from '@/lib/utils'
import type { BillingStatus, PlanId } from '@/lib/types'

interface BillingSectionProps {
  billingStatus: BillingStatus
}

// Relative rank used for "Upgrade" vs "Switch plan" labelling.
// Hidden sponsored plans are treated as pre-Starter.
const PLAN_RANK: Record<PlanId, number> = {
  free: 0,
  petits_genies: 0,
  starter: 1,
  pro: 2,
  clinician: 3,
}

const PLAN_ICON: Record<PlanId, React.ReactNode> = {
  free:          <CreditCard size={18} className="text-ink-tertiary" />,
  starter:       <Zap size={18} className="text-dblue-500" />,
  pro:           <Crown size={18} className="text-sage-600" />,
  clinician:     <Stethoscope size={18} className="text-sand-600" />,
  petits_genies: <Sparkles size={18} className="text-dblue-600" />,
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: BillingStatus['status'] }) {
  const styles: Record<string, string> = {
    active:     'bg-sage-100 text-sage-700 border-sage-200',
    trialing:   'bg-dblue-100 text-dblue-700 border-dblue-200',
    past_due:   'bg-sand-100 text-sand-700 border-sand-200',
    canceled:   'bg-raised text-ink-tertiary border-border',
    incomplete: 'bg-sand-100 text-sand-700 border-sand-200',
    paused:     'bg-raised text-ink-tertiary border-border',
  }
  const labels: Record<string, string> = {
    active: 'Active', trialing: 'Trial', past_due: 'Past due',
    canceled: 'Canceled', incomplete: 'Incomplete', paused: 'Paused',
  }

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-pill text-body-xs font-medium border',
      styles[status] ?? styles.active
    )}>
      {labels[status] ?? status}
    </span>
  )
}

// ─── Usage bar ────────────────────────────────────────────────────────────────

function UsageBar({ current, limit, label }: { current: number; limit: number; label: string }) {
  if (limit === -1) {
    return (
      <div className="flex items-center justify-between py-3">
        <span className="text-body-sm text-ink-secondary">{label}</span>
        <span className="text-body-sm font-medium text-sage-600">Unlimited</span>
      </div>
    )
  }

  const pct = Math.min((current / limit) * 100, 100)
  const barColor = pct >= 100 ? 'bg-red-400' : pct >= 80 ? 'bg-sand-400' : 'bg-sage-500'

  return (
    <div className="py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-body-sm text-ink-secondary">{label}</span>
        <span className={cn(
          'text-body-sm font-semibold',
          pct >= 100 ? 'text-red-600' : pct >= 80 ? 'text-sand-600' : 'text-ink'
        )}>
          {current} / {limit}
        </span>
      </div>
      <div className="h-1.5 bg-raised rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full', barColor)}
          style={{ width: `${pct}%`, transition: 'width 400ms ease-smooth' }}
        />
      </div>
    </div>
  )
}

// ─── Plan card ────────────────────────────────────────────────────────────────

function PlanCard({
  planId,
  currentPlanId,
  onUpgrade,
  loading,
}: {
  planId: PlanId
  currentPlanId: PlanId
  onUpgrade: (planId: PlanId) => void
  loading: boolean
}) {
  const plan = PLANS[planId]
  const isCurrent = planId === currentPlanId
  const isPlanHigher = PLAN_RANK[planId] > PLAN_RANK[currentPlanId]

  return (
    <div className={cn(
      'relative rounded-card-lg border p-5 flex flex-col gap-4',
      isCurrent
        ? 'border-sage-400 shadow-card bg-white'
        : 'border-border bg-surface',
    )}>
      {isCurrent && (
        <div className="absolute -top-3 left-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-sage-500 text-white text-body-xs font-semibold rounded-pill shadow-button">
            <CheckCircle2 size={11} strokeWidth={2.5} />
            Current plan
          </span>
        </div>
      )}

      {plan.highlighted && !isCurrent && (
        <div className="absolute -top-3 left-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-dblue-500 text-white text-body-xs font-semibold rounded-pill shadow-button">
            <Sparkles size={11} strokeWidth={2} />
            Most popular
          </span>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-1">
          {PLAN_ICON[planId]}
          <h4 className="font-display font-semibold text-ink text-body-base">{plan.name}</h4>
        </div>
        <div className="flex items-baseline gap-1 mt-1">
          {plan.priceCAD === 0 ? (
            <span className="text-display-sm font-bold text-ink">Free</span>
          ) : (
            <>
              <span className="text-display-sm font-bold text-ink">${plan.priceCAD}</span>
              <span className="text-body-xs text-ink-tertiary">CAD/mo</span>
            </>
          )}
        </div>
      </div>

      <ul className="space-y-2 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-body-xs text-ink-secondary">
            <CheckCircle2 size={13} className="text-sage-500 mt-0.5 shrink-0" strokeWidth={2} />
            {f}
          </li>
        ))}
      </ul>

      {!isCurrent && plan.priceCAD > 0 && (
        <button
          onClick={() => onUpgrade(planId)}
          disabled={loading}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-card text-body-sm font-semibold focus-ring disabled:opacity-60',
            isPlanHigher
              ? 'bg-sage-500 text-white shadow-button hover:bg-sage-600'
              : 'bg-surface border border-border text-ink-secondary hover:bg-raised',
          )}
          style={{ transitionProperty: 'background-color, transform', transitionDuration: '150ms' }}
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <>
              {isPlanHigher ? 'Upgrade' : 'Switch plan'}
              <ArrowRight size={13} strokeWidth={2.5} />
            </>
          )}
        </button>
      )}

      {isCurrent && plan.priceCAD === 0 && (
        <div className="text-body-xs text-ink-tertiary text-center py-1">
          Your current plan
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function BillingSection({ billingStatus }: BillingSectionProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [portalError, setPortalError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isCheckoutLoading, startCheckout] = useTransition()
  const [isPortalLoading, startPortal] = useTransition()

  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      setSuccessMessage('Your plan has been updated! It may take a moment to reflect.')
      const params = new URLSearchParams(searchParams.toString())
      params.delete('checkout')
      const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname
      router.replace(newUrl, { scroll: false })
    }
  }, [searchParams, router])

  function handleUpgrade(planId: PlanId) {
    setCheckoutError(null)
    startCheckout(async () => {
      const result = await createCheckoutSession(planId)
      if (result.error) {
        setCheckoutError(result.error)
        return
      }
      if (result.url) {
        window.location.href = result.url
      }
    })
  }

  function handlePortal() {
    setPortalError(null)
    startPortal(async () => {
      const result = await createPortalSession()
      if (result.error) {
        setPortalError(result.error)
        return
      }
      if (result.url) {
        window.location.href = result.url
      }
    })
  }

  const currentPlan = PLANS[billingStatus.planId]
  const isSponsored = billingStatus.planId === 'petits_genies'
  const periodEndDate = billingStatus.currentPeriodEnd
    ? new Date(billingStatus.currentPeriodEnd).toLocaleDateString('en-CA', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : null

  return (
    <div className="space-y-8">
      {successMessage && (
        <div className="flex items-start gap-3 p-4 bg-sage-50 border border-sage-200 rounded-card-lg">
          <CheckCircle2 size={18} className="text-sage-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-body-sm font-medium text-sage-800">{successMessage}</p>
            <p className="text-body-xs text-sage-600 mt-0.5">
              Refresh the page if your plan hasn&apos;t updated yet.
            </p>
          </div>
        </div>
      )}

      {/* Current plan overview */}
      <div className="bg-white rounded-card-lg shadow-card border border-border/50 p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h3 className="font-display text-display-sm font-semibold text-ink mb-1">
              Current plan
            </h3>
            <p className="text-body-sm text-ink-secondary">
              Your active subscription and usage today.
            </p>
          </div>
          {!isSponsored && <StatusBadge status={billingStatus.status} />}
        </div>

        <div className="flex items-center gap-4 p-4 bg-surface rounded-card border border-border/50 mb-6">
          <div className="w-10 h-10 rounded-card bg-sage-100 flex items-center justify-center shrink-0">
            {PLAN_ICON[billingStatus.planId]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-body-sm font-semibold text-ink">{currentPlan.name}</p>
            <p className="text-body-xs text-ink-tertiary">
              {isSponsored
                ? 'Provided by your clinic'
                : currentPlan.priceCAD === 0
                  ? 'Free forever'
                  : `$${currentPlan.priceCAD} CAD / month`}
            </p>
          </div>
          {periodEndDate && !isSponsored && (
            <div className="text-right shrink-0">
              <p className="text-body-xs text-ink-tertiary flex items-center gap-1 justify-end">
                <Clock size={11} />
                {billingStatus.cancelAtPeriodEnd ? 'Cancels' : 'Renews'}
              </p>
              <p className="text-body-xs font-medium text-ink mt-0.5">{periodEndDate}</p>
            </div>
          )}
        </div>

        {/* Past due warning */}
        {billingStatus.status === 'past_due' && !isSponsored && (
          <div className="flex items-start gap-3 p-4 bg-sand-50 border border-sand-200 rounded-card mb-6">
            <AlertCircle size={16} className="text-sand-600 mt-0.5 shrink-0" />
            <p className="text-body-xs text-sand-800">
              Your last payment failed. Please update your payment method to keep access.
            </p>
          </div>
        )}

        {billingStatus.cancelAtPeriodEnd && !isSponsored && (
          <div className="flex items-start gap-3 p-4 bg-raised border border-border rounded-card mb-6">
            <AlertCircle size={16} className="text-ink-tertiary mt-0.5 shrink-0" />
            <p className="text-body-xs text-ink-secondary">
              Your subscription will cancel on {periodEndDate}. You&apos;ll revert to the Free plan after that date.
            </p>
          </div>
        )}

        {/* Usage counters */}
        <div className="divide-y divide-border">
          <UsageBar
            current={billingStatus.questionsToday}
            limit={billingStatus.questionLimit}
            label="Questions today"
          />
          <UsageBar
            current={billingStatus.childCount}
            limit={billingStatus.childLimit}
            label="Child profiles"
          />
        </div>

        {/* Action buttons */}
        {!isSponsored && (
          <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-border">
            {billingStatus.stripeCustomerId && (
              <button
                onClick={handlePortal}
                disabled={isPortalLoading}
                className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-card text-body-sm font-medium text-ink hover:bg-raised focus-ring active:scale-[0.98] disabled:opacity-60"
                style={{ transitionProperty: 'background-color, transform', transitionDuration: '150ms' }}
              >
                {isPortalLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <ExternalLink size={14} />
                )}
                Manage billing
              </button>
            )}

            {billingStatus.planId === 'free' && (
              <div className="flex items-center gap-1.5 text-body-xs text-ink-tertiary">
                <Users size={13} />
                Add more profiles by upgrading below
              </div>
            )}
          </div>
        )}

        {portalError && <p className="mt-3 text-body-xs text-red-600">{portalError}</p>}
      </div>

      {/* Sponsored plan notice — hides Plans grid */}
      {isSponsored && (
        <div className="bg-white rounded-card-lg shadow-card border border-dblue-200 p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-card bg-dblue-50 flex items-center justify-center shrink-0">
              <Sparkles size={18} className="text-dblue-600" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-ink mb-1">
                You&apos;re on a clinic-sponsored plan
              </h3>
              <p className="text-body-sm text-ink-secondary">
                Your access to Devy is provided by Petits Génies. If you have questions about your plan,
                please contact the clinic directly.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Plans grid — only for self-serve customers */}
      {!isSponsored && (
        <div className="bg-white rounded-card-lg shadow-card border border-border/50 p-6">
          <h3 className="font-display text-display-sm font-semibold text-ink mb-1">Plans</h3>
          <p className="text-body-sm text-ink-secondary mb-6">
            All prices in Canadian dollars. Cancel or change anytime.
          </p>

          {checkoutError && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-card mb-5">
              <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-body-xs text-red-700">{checkoutError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
            {PUBLIC_PLAN_IDS.map((id) => (
              <PlanCard
                key={id}
                planId={id}
                currentPlanId={billingStatus.planId}
                onUpgrade={handleUpgrade}
                loading={isCheckoutLoading}
              />
            ))}
          </div>

          {billingStatus.planId !== 'free' && (
            <p className="mt-5 text-body-xs text-ink-tertiary text-center">
              To downgrade or cancel your subscription, use the{' '}
              <button
                onClick={handlePortal}
                className="underline hover:text-ink focus-ring rounded"
              >
                billing portal
              </button>
              .
            </p>
          )}
        </div>
      )}

      {/* Over-limit notice */}
      {billingStatus.childLimit !== -1 &&
        billingStatus.childCount > billingStatus.childLimit && (
          <div className="flex items-start gap-3 p-4 bg-sand-50 border border-sand-200 rounded-card-lg">
            <AlertCircle size={16} className="text-sand-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-body-sm font-medium text-sand-800">
                You have {billingStatus.childCount} profiles but your plan allows {billingStatus.childLimit}.
              </p>
              <p className="text-body-xs text-sand-700 mt-1">
                Your existing profiles are safe. You won&apos;t be able to add new ones until you&apos;re under the limit or upgrade.
              </p>
            </div>
          </div>
        )}
    </div>
  )
}
