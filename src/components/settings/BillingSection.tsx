'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  CreditCard, Zap, Users, CheckCircle2, AlertCircle,
  Clock, ArrowRight, ExternalLink, Loader2, Crown, Stethoscope, Sparkles,
} from 'lucide-react'
import { createCheckoutSession, createPortalSession } from '@/lib/actions/billing'
import { useLanguage } from '@/components/shared/LanguageProvider'
import { PLANS, PUBLIC_PLAN_IDS } from '@/lib/stripe/plans'
import { cn } from '@/lib/utils'
import { formatDateFull } from '@/lib/utils'
import type { BillingStatus, PlanId } from '@/lib/types'

interface BillingSectionProps {
  billingStatus: BillingStatus
}

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

const PLAN_TRANSLATION_KEY: Record<PlanId, keyof typeof PLANS> = {
  free: 'free',
  starter: 'starter',
  pro: 'pro',
  clinician: 'clinician',
  petits_genies: 'petits_genies',
}

export function BillingSection({ billingStatus }: BillingSectionProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t, lang } = useLanguage()
  const b = t.settings.billing

  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [portalError, setPortalError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isCheckoutLoading, startCheckout] = useTransition()
  const [isPortalLoading, startPortal] = useTransition()

  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      setSuccessMessage(b.successMessage)
      const params = new URLSearchParams(searchParams.toString())
      params.delete('checkout')
      const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname
      router.replace(newUrl, { scroll: false })
    }
  }, [searchParams, router, b.successMessage])

  function handleUpgrade(planId: PlanId) {
    setCheckoutError(null)
    startCheckout(async () => {
      const result = await createCheckoutSession(planId)
      if (result.error) { setCheckoutError(result.error); return }
      if (result.url) window.location.href = result.url
    })
  }

  function handlePortal() {
    setPortalError(null)
    startPortal(async () => {
      const result = await createPortalSession()
      if (result.error) { setPortalError(result.error); return }
      if (result.url) window.location.href = result.url
    })
  }

  const currentPlanKey = PLAN_TRANSLATION_KEY[billingStatus.planId]
  const currentPlanName = t.plans[currentPlanKey].name
  const currentPlanPriceCAD = PLANS[billingStatus.planId].priceCAD
  const isSponsored = billingStatus.planId === 'petits_genies'
  const periodEndDate = billingStatus.currentPeriodEnd
    ? formatDateFull(billingStatus.currentPeriodEnd, lang)
    : null

  return (
    <div className="space-y-8">
      {successMessage && (
        <div className="flex items-start gap-3 p-4 bg-sage-50 border border-sage-200 rounded-card-lg">
          <CheckCircle2 size={18} className="text-sage-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-body-sm font-medium text-sage-800">{successMessage}</p>
            <p className="text-body-xs text-sage-600 mt-0.5">{b.successHint}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-card-lg shadow-card border border-border/50 p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h3 className="font-display text-display-sm font-semibold text-ink mb-1">{b.currentPlan}</h3>
            <p className="text-body-sm text-ink-secondary">{b.currentPlanDesc}</p>
          </div>
          {!isSponsored && (
            <span className={cn(
              'inline-flex items-center px-2.5 py-0.5 rounded-pill text-body-xs font-medium border',
              billingStatus.status === 'active' ? 'bg-sage-100 text-sage-700 border-sage-200'
              : billingStatus.status === 'trialing' ? 'bg-dblue-100 text-dblue-700 border-dblue-200'
              : billingStatus.status === 'past_due' ? 'bg-sand-100 text-sand-700 border-sand-200'
              : 'bg-raised text-ink-tertiary border-border',
            )}>
              {b.statuses[billingStatus.status]}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 p-4 bg-surface rounded-card border border-border/50 mb-6">
          <div className="w-10 h-10 rounded-card bg-sage-100 flex items-center justify-center shrink-0">
            {PLAN_ICON[billingStatus.planId]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-body-sm font-semibold text-ink">{currentPlanName}</p>
            <p className="text-body-xs text-ink-tertiary">
              {isSponsored
                ? b.providedByClinic
                : currentPlanPriceCAD === 0
                  ? b.freeForever
                  : `$${currentPlanPriceCAD} ${t.landing.pricing.perMonth}`}
            </p>
          </div>
          {periodEndDate && !isSponsored && (
            <div className="text-right shrink-0">
              <p className="text-body-xs text-ink-tertiary flex items-center gap-1 justify-end">
                <Clock size={11} />
                {billingStatus.cancelAtPeriodEnd ? b.cancels : b.renews}
              </p>
              <p className="text-body-xs font-medium text-ink mt-0.5">{periodEndDate}</p>
            </div>
          )}
        </div>

        {billingStatus.status === 'past_due' && !isSponsored && (
          <div className="flex items-start gap-3 p-4 bg-sand-50 border border-sand-200 rounded-card mb-6">
            <AlertCircle size={16} className="text-sand-600 mt-0.5 shrink-0" />
            <p className="text-body-xs text-sand-800">{b.pastDueBody}</p>
          </div>
        )}

        {billingStatus.cancelAtPeriodEnd && !isSponsored && (
          <div className="flex items-start gap-3 p-4 bg-raised border border-border rounded-card mb-6">
            <AlertCircle size={16} className="text-ink-tertiary mt-0.5 shrink-0" />
            <p className="text-body-xs text-ink-secondary">
              {b.cancelAtPeriodEndBody.replace('{date}', periodEndDate ?? '')}
            </p>
          </div>
        )}

        <div className="divide-y divide-border">
          <UsageBar
            current={billingStatus.questionsToday}
            limit={billingStatus.questionLimit}
            label={b.questionsToday}
            unlimitedLabel={b.unlimited}
          />
          <UsageBar
            current={billingStatus.childCount}
            limit={billingStatus.childLimit}
            label={b.childProfiles}
            unlimitedLabel={b.unlimited}
          />
        </div>

        {!isSponsored && (
          <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-border">
            {billingStatus.stripeCustomerId && (
              <button
                onClick={handlePortal}
                disabled={isPortalLoading}
                className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-card text-body-sm font-medium text-ink hover:bg-raised focus-ring active:scale-[0.98] disabled:opacity-60"
                style={{ transitionProperty: 'background-color, transform', transitionDuration: '150ms' }}
              >
                {isPortalLoading ? <Loader2 size={14} className="animate-spin" /> : <ExternalLink size={14} />}
                {b.manageBilling}
              </button>
            )}

            {billingStatus.planId === 'free' && (
              <div className="flex items-center gap-1.5 text-body-xs text-ink-tertiary">
                <Users size={13} />
                {b.addProfilesHint}
              </div>
            )}
          </div>
        )}

        {portalError && <p className="mt-3 text-body-xs text-red-600">{portalError}</p>}
      </div>

      {isSponsored && (
        <div className="bg-white rounded-card-lg shadow-card border border-dblue-200 p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-card bg-dblue-50 flex items-center justify-center shrink-0">
              <Sparkles size={18} className="text-dblue-600" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-ink mb-1">{b.sponsoredTitle}</h3>
              <p className="text-body-sm text-ink-secondary">{b.sponsoredBody}</p>
            </div>
          </div>
        </div>
      )}

      {!isSponsored && (
        <div className="bg-white rounded-card-lg shadow-card border border-border/50 p-6">
          <h3 className="font-display text-display-sm font-semibold text-ink mb-1">{b.plansTitle}</h3>
          <p className="text-body-sm text-ink-secondary mb-6">{b.plansDescription}</p>

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
              {b.downgradeHint}{' '}
              <button
                onClick={handlePortal}
                className="underline hover:text-ink focus-ring rounded"
              >
                {b.billingPortalLink}
              </button>
              .
            </p>
          )}
        </div>
      )}

      {billingStatus.childLimit !== -1 &&
        billingStatus.childCount > billingStatus.childLimit && (
          <div className="flex items-start gap-3 p-4 bg-sand-50 border border-sand-200 rounded-card-lg">
            <AlertCircle size={16} className="text-sand-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-body-sm font-medium text-sand-800">
                {b.overLimitTitle
                  .replace('{count}', String(billingStatus.childCount))
                  .replace('{limit}', String(billingStatus.childLimit))}
              </p>
              <p className="text-body-xs text-sand-700 mt-1">{b.overLimitBody}</p>
            </div>
          </div>
        )}
    </div>
  )
}

function UsageBar({ current, limit, label, unlimitedLabel }: { current: number; limit: number; label: string; unlimitedLabel: string }) {
  if (limit === -1) {
    return (
      <div className="flex items-center justify-between py-3">
        <span className="text-body-sm text-ink-secondary">{label}</span>
        <span className="text-body-sm font-medium text-sage-600">{unlimitedLabel}</span>
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
  const { t } = useLanguage()
  const b = t.settings.billing
  const plan = PLANS[planId]
  const translated = t.plans[PLAN_TRANSLATION_KEY[planId]]
  const isCurrent = planId === currentPlanId
  const isPlanHigher = PLAN_RANK[planId] > PLAN_RANK[currentPlanId]

  return (
    <div className={cn(
      'relative rounded-card-lg border p-5 flex flex-col gap-4',
      isCurrent ? 'border-sage-400 shadow-card bg-white' : 'border-border bg-surface',
    )}>
      {isCurrent && (
        <div className="absolute -top-3 left-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-sage-500 text-white text-body-xs font-semibold rounded-pill shadow-button">
            <CheckCircle2 size={11} strokeWidth={2.5} />
            {b.currentBadge}
          </span>
        </div>
      )}

      {plan.highlighted && !isCurrent && (
        <div className="absolute -top-3 left-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-dblue-500 text-white text-body-xs font-semibold rounded-pill shadow-button">
            <Sparkles size={11} strokeWidth={2} />
            {b.mostPopular}
          </span>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-1">
          {PLAN_ICON[planId]}
          <h4 className="font-display font-semibold text-ink text-body-base">{translated.name}</h4>
        </div>
        <div className="flex items-baseline gap-1 mt-1">
          {plan.priceCAD === 0 ? (
            <span className="text-display-sm font-bold text-ink">{t.plans.free.name}</span>
          ) : (
            <>
              <span className="text-display-sm font-bold text-ink">${plan.priceCAD}</span>
              <span className="text-body-xs text-ink-tertiary">{t.landing.pricing.perMonth}</span>
            </>
          )}
        </div>
      </div>

      <ul className="space-y-2 flex-1">
        {translated.features.map((f) => (
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
              {isPlanHigher ? b.upgrade : b.switchPlan}
              <ArrowRight size={13} strokeWidth={2.5} />
            </>
          )}
        </button>
      )}

      {isCurrent && plan.priceCAD === 0 && (
        <div className="text-body-xs text-ink-tertiary text-center py-1">{b.currentBadge}</div>
      )}
    </div>
  )
}
