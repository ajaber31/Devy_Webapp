import Link from 'next/link'
import { CheckCircle2, Zap, Crown, Stethoscope, Sparkles } from 'lucide-react'
import { AnimateIn } from '@/components/shared/AnimateIn'
import { NoiseTexture } from '@/components/shared/NoiseTexture'
import { PLANS, PUBLIC_PLAN_IDS } from '@/lib/stripe/plans'
import { getT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { PlanId } from '@/lib/types'
import type { Lang } from '@/lib/i18n'

/**
 * "Clinical Editorial" pricing — four tiers with distinct per-tier character.
 * Folio marker, Lora italic taglines, Pro gets a textured paper highlight.
 * Every card differentiated: Free (understated), Starter (dblue line),
 * Pro (sage filled, signature card), Clinician (warm sand accent).
 */

const PLAN_ICON: Record<PlanId, React.ReactNode> = {
  free:          null,
  starter:       <Zap size={16} className="text-dblue-500" strokeWidth={2} />,
  pro:           <Crown size={16} className="text-sage-700" strokeWidth={2} />,
  clinician:     <Stethoscope size={16} className="text-sand-600" strokeWidth={2} />,
  petits_genies: null,
}

const TIER_STYLES: Record<PlanId, {
  card: string
  name: string
  price: string
  tagline: string
  check: string
  button: string
  badge?: string
  noise?: boolean
}> = {
  free: {
    card: 'bg-white border-border',
    name: 'text-ink',
    price: 'text-ink',
    tagline: 'text-ink-tertiary',
    check: 'text-ink-tertiary',
    button: 'bg-white border border-border text-ink hover:bg-raised',
  },
  starter: {
    card: 'bg-white border-dblue-200 border-t-[3px] border-t-dblue-400',
    name: 'text-ink',
    price: 'text-ink',
    tagline: 'text-dblue-700',
    check: 'text-dblue-500',
    button: 'bg-dblue-500 text-white shadow-button hover:bg-dblue-600',
  },
  pro: {
    card: 'bg-gradient-to-b from-sage-50 via-white to-sage-50/60 border-sage-300 shadow-floating',
    name: 'text-sage-800',
    price: 'text-sage-900',
    tagline: 'text-sage-700 font-display italic',
    check: 'text-sage-600',
    button: 'bg-sage-600 text-white shadow-button hover:bg-sage-700',
    badge: 'most-popular',
    noise: true,
  },
  clinician: {
    card: 'bg-white border-sand-200 border-t-[3px] border-t-sand-500',
    name: 'text-ink',
    price: 'text-ink',
    tagline: 'text-sand-600',
    check: 'text-sand-500',
    button: 'bg-sand-500 text-white shadow-button hover:bg-sand-600',
  },
  petits_genies: {
    card: '', name: '', price: '', tagline: '', check: '', button: '',
  },
}

export function PricingSection({ lang = 'en' }: { lang?: Lang }) {
  const fullT = getT(lang)
  const t = fullT.landing.pricing
  const plansT = fullT.plans

  return (
    <section id="pricing" className="relative py-28 bg-[#FBF8F1] overflow-hidden">
      <NoiseTexture opacity={0.03} />

      {/* Atmospheric glows */}
      <div aria-hidden className="absolute top-0 left-1/4 w-[600px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top, rgba(92,134,81,0.09) 0%, transparent 65%)', filter: 'blur(40px)' }} />
      <div aria-hidden className="absolute bottom-0 right-1/4 w-[500px] h-[350px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at bottom, rgba(184,115,51,0.08) 0%, transparent 65%)', filter: 'blur(40px)' }} />

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Folio marker */}
        <AnimateIn>
          <div className="flex items-center justify-between mb-14 text-ink-tertiary">
            <div className="flex items-center gap-3">
              <span className="font-display italic text-body-sm">§</span>
              <span className="font-display italic text-body-xs tracking-wider uppercase">IV · {t.label}</span>
              <span className="hidden sm:block h-px w-24 bg-border" />
            </div>
            <span className="font-display italic text-body-xs tracking-wider">
              pp. 04
            </span>
          </div>
        </AnimateIn>

        {/* Heading */}
        <div className="mb-16 grid grid-cols-1 lg:grid-cols-12 gap-y-6 gap-x-10">
          <AnimateIn className="lg:col-span-7">
            <h2 className="font-display font-bold text-ink tracking-tight leading-[1.0] text-[clamp(2.25rem,5vw,3.75rem)]">
              {t.heading.split(' ').slice(0, -1).join(' ')}{' '}
              <em className="font-display italic text-sage-700">{t.heading.split(' ').slice(-1)[0]}</em>
            </h2>
          </AnimateIn>
          <AnimateIn className="lg:col-span-5 lg:pt-3" delay={80}>
            <p className="text-body-lg text-ink-secondary leading-relaxed font-display italic">
              {t.description}
            </p>
            <p className="text-body-xs text-ink-tertiary mt-3 tracking-wide">
              {t.priceNote}
            </p>
          </AnimateIn>
        </div>

        {/* Four tier grid — each card differentiated. pt-6 gives the Pro ribbon breathing room. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative pt-6">
          {PUBLIC_PLAN_IDS.map((planId, i) => {
            const plan = PLANS[planId]
            const translated = plansT[planId as keyof typeof plansT]
            const style = TIER_STYLES[planId]
            const isPro = planId === 'pro'

            return (
              <AnimateIn key={planId} delay={i * 60}>
                <article
                  className={cn(
                    'relative rounded-card-lg border flex flex-col h-full',
                    style.card,
                  )}
                >
                  {style.noise && (
                    <div className="absolute inset-0 pointer-events-none rounded-[inherit] overflow-hidden">
                      <NoiseTexture opacity={0.05} />
                    </div>
                  )}

                  {/* Most-popular ribbon */}
                  {style.badge === 'most-popular' && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sage-700 text-white text-body-xs font-display italic rounded-pill shadow-button whitespace-nowrap tracking-wide">
                        <Sparkles size={11} strokeWidth={2} />
                        {t.mostPopular}
                      </span>
                    </div>
                  )}

                  <div className={cn('p-6 flex flex-col flex-1 relative', isPro && 'pt-8')}>
                    {/* Tier header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {PLAN_ICON[planId]}
                        <h3 className={cn('font-display font-semibold tracking-tight', style.name)}>
                          {translated.name}
                        </h3>
                      </div>
                      <span className="font-display italic text-body-xs text-ink-tertiary tracking-wider">
                        no. 0{i + 1}
                      </span>
                    </div>

                    {translated.tagline && (
                      <p className={cn('text-body-xs mb-5', style.tagline)}>
                        {translated.tagline}
                      </p>
                    )}

                    {/* Price */}
                    <div className="flex items-baseline gap-1.5 mb-1">
                      {plan.priceCAD === 0 ? (
                        <span className={cn('font-display font-bold text-[2.75rem] leading-none tracking-tight', style.price)}>
                          {t.free}
                        </span>
                      ) : (
                        <>
                          <span className="font-display text-body-sm text-ink-tertiary">$</span>
                          <span className={cn('font-display font-bold text-[2.75rem] leading-none tracking-tight', style.price)}>
                            {plan.priceCAD}
                          </span>
                          <span className="font-display italic text-body-xs text-ink-tertiary ml-1">
                            {t.perMonth}
                          </span>
                        </>
                      )}
                    </div>
                    {/* Baseline rule */}
                    <div className="h-px w-full bg-gradient-to-r from-border via-border/50 to-transparent mt-5 mb-6" />

                    {/* Feature list with Lora italic check style */}
                    <ul className="space-y-2.5 flex-1 mb-6">
                      {translated.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5">
                          <CheckCircle2
                            size={14}
                            className={cn('mt-0.5 shrink-0', style.check)}
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
                        className={cn(
                          'w-full flex items-center justify-center px-5 py-2.5 rounded-card text-body-sm font-semibold focus-ring active:scale-[0.98]',
                          style.button,
                        )}
                        style={{ transitionProperty: 'background-color, transform', transitionDuration: '150ms' }}
                      >
                        {t.getStartedFree}
                      </Link>
                    ) : (
                      <Link
                        href={`/signup?plan=${planId}`}
                        className={cn(
                          'w-full flex items-center justify-center px-5 py-2.5 rounded-card text-body-sm font-semibold focus-ring active:scale-[0.98]',
                          style.button,
                        )}
                        style={{ transitionProperty: 'background-color, transform', transitionDuration: '150ms' }}
                      >
                        {t.getStarted}
                      </Link>
                    )}
                  </div>

                  {/* Bottom accent rule for pro */}
                  {isPro && (
                    <div aria-hidden className="h-1 bg-gradient-to-r from-sage-600 via-sage-400 to-sand-500 opacity-70 rounded-b-card-lg" />
                  )}
                </article>
              </AnimateIn>
            )
          })}
        </div>

        {/* Footer note */}
        <AnimateIn delay={320}>
          <div className="mt-14 flex items-center justify-center gap-3 text-ink-tertiary">
            <div className="h-px w-16 bg-border" />
            <p className="text-center text-body-xs font-display italic">
              {t.footerNote}{' '}
              <a href="mailto:hello@devy.ca" className="underline hover:text-ink transition-colors">
                {t.contact}
              </a>
              .
            </p>
            <div className="h-px w-16 bg-border" />
          </div>
        </AnimateIn>
      </div>
    </section>
  )
}
