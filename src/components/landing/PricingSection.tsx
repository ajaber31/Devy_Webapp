import Link from 'next/link'
import { CheckCircle2, Zap, Crown, Stethoscope, Sparkles } from 'lucide-react'
import { AnimateIn } from '@/components/shared/AnimateIn'
import { PLANS, PUBLIC_PLAN_IDS } from '@/lib/stripe/plans'
import { getT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { PlanId } from '@/lib/types'
import type { Lang } from '@/lib/i18n'

const PLAN_ICONS: Partial<Record<PlanId, React.ReactNode>> = {
  free:      <span className="text-ink-tertiary text-body-xs font-medium uppercase tracking-wider">Free</span>,
  starter:   <Zap size={16} className="text-dblue-500" strokeWidth={2} />,
  pro:       <Crown size={16} className="text-sage-600" strokeWidth={2} />,
  clinician: <Stethoscope size={16} className="text-sand-600" strokeWidth={2} />,
}

export function PricingSection({ lang = 'en' }: { lang?: Lang }) {
  const t = getT(lang).landing.pricing

  return (
    <section id="pricing" className="py-24 px-6 bg-canvas">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <AnimateIn>
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-sage-100 text-sage-700 rounded-pill text-body-xs font-medium border border-sage-200 mb-4">
              <Sparkles size={12} strokeWidth={2} />
              {t.label}
            </div>
            <h2 className="font-display text-display-lg font-bold text-ink tracking-tight mb-4">
              {t.heading}
            </h2>
            <p className="text-body-lg text-ink-secondary max-w-xl mx-auto leading-relaxed">
              {t.description}
            </p>
            <p className="text-body-xs text-ink-tertiary mt-2">
              {t.priceNote}
            </p>
          </div>
        </AnimateIn>

        {/* Plan cards — 4 visible tiers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PUBLIC_PLAN_IDS.map((planId, i) => {
            const plan = PLANS[planId]
            const isHighlighted = !!plan.highlighted

            return (
              <AnimateIn key={planId} delay={i * 60}>
                <div className={cn(
                  'relative rounded-card-lg border flex flex-col h-full',
                  isHighlighted
                    ? 'border-sage-400 shadow-floating bg-white'
                    : 'border-border shadow-card bg-white',
                )}>
                  {/* Most popular badge */}
                  {isHighlighted && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sage-500 text-white text-body-xs font-semibold rounded-pill shadow-button whitespace-nowrap">
                        <Sparkles size={11} strokeWidth={2} />
                        {t.mostPopular}
                      </span>
                    </div>
                  )}

                  <div className={cn('p-6 flex flex-col flex-1', isHighlighted && 'pt-8')}>
                    {/* Plan header */}
                    <div className="flex items-center gap-2 mb-2">
                      {PLAN_ICONS[planId]}
                      <h3 className="font-display font-semibold text-ink">{plan.name}</h3>
                    </div>

                    {plan.tagline && (
                      <p className="text-body-xs text-ink-tertiary mb-4">{plan.tagline}</p>
                    )}

                    <div className="flex items-baseline gap-1 mb-6">
                      {plan.priceCAD === 0 ? (
                        <span className="text-display-lg font-bold text-ink">{t.free}</span>
                      ) : (
                        <>
                          <span className="text-display-lg font-bold text-ink">${plan.priceCAD}</span>
                          <span className="text-body-sm text-ink-tertiary">{t.perMonth}</span>
                        </>
                      )}
                    </div>

                    {/* Feature list */}
                    <ul className="space-y-2.5 flex-1 mb-7">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <CheckCircle2
                            size={14}
                            className={cn(
                              'mt-0.5 shrink-0',
                              isHighlighted ? 'text-sage-500' : 'text-sage-400',
                            )}
                            strokeWidth={2}
                          />
                          <span className="text-body-xs text-ink-secondary leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    {plan.priceCAD === 0 ? (
                      <Link
                        href="/signup"
                        className="w-full flex items-center justify-center px-5 py-2.5 bg-surface border border-border rounded-card text-body-sm font-semibold text-ink hover:bg-raised focus-ring active:scale-[0.98]"
                        style={{ transitionProperty: 'background-color, transform', transitionDuration: '150ms' }}
                      >
                        {t.getStartedFree}
                      </Link>
                    ) : (
                      <Link
                        href={`/signup?plan=${planId}`}
                        className={cn(
                          'w-full flex items-center justify-center px-5 py-2.5 rounded-card text-body-sm font-semibold focus-ring active:scale-[0.98]',
                          isHighlighted
                            ? 'bg-sage-500 text-white shadow-button hover:bg-sage-600'
                            : 'bg-dblue-500 text-white shadow-button hover:bg-dblue-600',
                        )}
                        style={{ transitionProperty: 'background-color, transform', transitionDuration: '150ms' }}
                      >
                        {t.getStarted}
                      </Link>
                    )}
                  </div>
                </div>
              </AnimateIn>
            )
          })}
        </div>

        {/* Footer note */}
        <AnimateIn delay={300}>
          <p className="text-center text-body-xs text-ink-tertiary mt-10">
            {t.footerNote}{' '}
            <a href="mailto:hello@devy.ca" className="underline hover:text-ink">
              {t.contact}
            </a>
            .
          </p>
        </AnimateIn>
      </div>
    </section>
  )
}
