import { AnimateIn } from '@/components/shared/AnimateIn'
import { NoiseTexture } from '@/components/shared/NoiseTexture'
import { getT } from '@/lib/i18n'
import type { Lang } from '@/lib/i18n'

/**
 * "Clinical Editorial" redesign — the evidence chain laid out as a magazine spread.
 * Each step is a numbered editorial block connected by a hand-drawn sketch arrow.
 * Decorative folio markers, roman-numeral section ID, Lora italic eyebrows.
 */
export function HowItWorksSection({ lang = 'en' }: { lang?: Lang }) {
  const t = getT(lang).landing.howItWorks

  const steps = [
    {
      num: '01',
      eyebrow: lang === 'fr' ? 'demandé' : 'asked',
      title: t.step1Title,
      description: t.step1Desc,
      accent: 'sage',
      diagram: (
        // Speech bubble with typing cursor — "ask in plain language"
        <svg viewBox="0 0 120 64" fill="none" className="w-full h-auto">
          <path d="M10 12 H100 A8 8 0 0 1 108 20 V40 A8 8 0 0 1 100 48 H32 L22 58 V48 H18 A8 8 0 0 1 10 40 Z"
                stroke="#5C8651" strokeWidth="1.4" fill="#F6F1E5" />
          <line x1="22" y1="22" x2="72" y2="22" stroke="#385432" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="22" y1="30" x2="92" y2="30" stroke="#385432" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="22" y1="38" x2="58" y2="38" stroke="#385432" strokeWidth="1.2" strokeLinecap="round" />
          <rect x="60" y="34" width="2" height="8" fill="#5C8651">
            <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />
          </rect>
        </svg>
      ),
    },
    {
      num: '02',
      eyebrow: lang === 'fr' ? 'vérifié' : 'searched',
      title: t.step2Title,
      description: t.step2Desc,
      accent: 'dblue',
      diagram: (
        // Stacked document cards with a magnifying sweep — KB + PubMed search
        <svg viewBox="0 0 120 64" fill="none" className="w-full h-auto">
          <rect x="14" y="14" width="40" height="44" rx="2" fill="#EEF1F6" stroke="#4F739F" strokeWidth="1.2" />
          <rect x="22" y="10" width="40" height="44" rx="2" fill="#F6F1E5" stroke="#385432" strokeWidth="1.2" />
          <rect x="30" y="6"  width="40" height="44" rx="2" fill="#FFFFFF" stroke="#5C8651" strokeWidth="1.4" />
          <line x1="36" y1="16" x2="64" y2="16" stroke="#385432" strokeWidth="1" strokeLinecap="round" />
          <line x1="36" y1="22" x2="60" y2="22" stroke="#385432" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
          <line x1="36" y1="28" x2="64" y2="28" stroke="#385432" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
          <circle cx="88" cy="32" r="12" stroke="#B87333" strokeWidth="1.6" fill="none" />
          <line x1="97" y1="41" x2="108" y2="52" stroke="#B87333" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M83 32 h10 M88 27 v10" stroke="#B87333" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      num: '03',
      eyebrow: lang === 'fr' ? 'ancré' : 'grounded',
      title: t.step3Title,
      description: t.step3Desc,
      accent: 'sand',
      diagram: (
        // Document with a "grounded" trust pill at the bottom — matches actual UX
        <svg viewBox="0 0 120 64" fill="none" className="w-full h-auto">
          <rect x="16" y="8" width="88" height="48" rx="2.5" fill="#FFFFFF" stroke="#385432" strokeWidth="1.4" />
          <line x1="24" y1="18" x2="92" y2="18" stroke="#385432" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="24" y1="24" x2="82" y2="24" stroke="#385432" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
          <line x1="24" y1="30" x2="88" y2="30" stroke="#385432" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
          <line x1="24" y1="36" x2="74" y2="36" stroke="#385432" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
          {/* "Grounded" trust pill at bottom */}
          <rect x="24" y="42" width="54" height="10" rx="5" fill="#E8F0E2" stroke="#5C8651" strokeWidth="0.8" />
          <circle cx="29" cy="47" r="1.5" fill="#5C8651" />
          <text x="33" y="49" fontSize="4.5" fill="#385432" fontFamily="Inter, sans-serif" fontWeight="600">PubMed-grounded</text>
        </svg>
      ),
    },
  ]

  const accentClasses: Record<string, { bar: string; num: string; eyebrow: string; tab: string }> = {
    sage:  { bar: 'bg-sage-500',  num: 'text-sage-600',  eyebrow: 'text-sage-700',  tab: 'bg-sage-100 text-sage-700 border-sage-200' },
    dblue: { bar: 'bg-dblue-500', num: 'text-dblue-600', eyebrow: 'text-dblue-700', tab: 'bg-dblue-100 text-dblue-700 border-dblue-200' },
    sand:  { bar: 'bg-sand-500',  num: 'text-sand-600',  eyebrow: 'text-sand-600',  tab: 'bg-sand-100 text-sand-600 border-sand-200' },
  }

  return (
    <section id="how-it-works" className="relative py-28 bg-[#FBF8F1] overflow-hidden">
      <NoiseTexture opacity={0.035} />

      {/* warm paper corners */}
      <div aria-hidden className="absolute top-0 left-0 w-[420px] h-[280px] pointer-events-none opacity-60"
        style={{ background: 'radial-gradient(ellipse at top left, rgba(184,115,51,0.08) 0%, transparent 65%)' }} />
      <div aria-hidden className="absolute bottom-0 right-0 w-[420px] h-[280px] pointer-events-none opacity-60"
        style={{ background: 'radial-gradient(ellipse at bottom right, rgba(92,134,81,0.10) 0%, transparent 65%)' }} />

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Folio / section marker */}
        <AnimateIn>
          <div className="flex items-center justify-between mb-14">
            <div className="flex items-center gap-3 text-ink-tertiary">
              <span className="font-display italic text-body-sm">§</span>
              <span className="font-display italic text-body-xs tracking-wider uppercase">I · {t.label}</span>
              <span className="hidden sm:block h-px w-24 bg-border" />
            </div>
            <span className="font-display italic text-body-xs text-ink-tertiary tracking-wider">
              pp. 01
            </span>
          </div>
        </AnimateIn>

        {/* Heading — asymmetric, editorial */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-6 gap-x-10 mb-20">
          <AnimateIn className="lg:col-span-7">
            <h2 className="font-display font-bold text-ink tracking-tight leading-[1.02] text-[clamp(2.25rem,4.8vw,3.75rem)]">
              {t.heading.split('. ').map((chunk, i, arr) => (
                <span key={i}>
                  {chunk}
                  {i < arr.length - 1 && (
                    <>
                      .{' '}
                      <span className="font-display italic text-sage-600">
                        {/* visual emphasis on the second clause */}
                      </span>
                    </>
                  )}
                </span>
              ))}
            </h2>
          </AnimateIn>
          <AnimateIn className="lg:col-span-5 lg:pt-3" delay={80}>
            <div className="lg:border-l lg:border-sand-300/60 lg:pl-8 relative">
              <span aria-hidden className="hidden lg:block absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-sand-500" />
              <p className="text-body-lg text-ink-secondary leading-relaxed font-display italic">
                {t.description}
              </p>
            </div>
          </AnimateIn>
        </div>

        {/* Three steps — editorial blocks with connecting sketch arrows */}
        <div className="relative">
          {/* Hand-drawn connecting path (desktop only). Wavy sage line between steps. */}
          <svg
            aria-hidden
            className="hidden lg:block absolute top-[88px] left-0 right-0 w-full pointer-events-none"
            height="40"
            viewBox="0 0 1200 40"
            preserveAspectRatio="none"
          >
            <path
              d="M 100 20 Q 250 5, 400 20 T 700 20 T 1000 20"
              stroke="#B87333"
              strokeWidth="1.25"
              strokeDasharray="4 6"
              strokeLinecap="round"
              fill="none"
              opacity="0.55"
            />
            {/* Arrowhead at end */}
            <path d="M 1000 20 L 994 15 M 1000 20 L 994 25"
              stroke="#B87333" strokeWidth="1.25" strokeLinecap="round" fill="none" opacity="0.7" />
          </svg>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 relative">
            {steps.map((step, i) => {
              const a = accentClasses[step.accent]
              return (
                <AnimateIn key={step.num} delay={i * 140}>
                  <article className="relative group">
                    {/* Big serif step number, outlined */}
                    <div className="flex items-start justify-between mb-5">
                      <div
                        className={`font-display font-bold leading-none text-[5rem] tracking-tighter ${a.num}`}
                        style={{ WebkitTextStroke: '0px' }}
                      >
                        {step.num}
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill border text-body-xs font-display italic ${a.tab}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${a.bar}`} />
                        {step.eyebrow}
                      </span>
                    </div>

                    {/* Diagram — the visual "this is what happens" */}
                    <div className="relative rounded-card border border-border/60 bg-white/70 backdrop-blur-[1px] p-4 mb-5 shadow-[0_1px_0_rgba(56,84,50,0.06),0_12px_24px_-16px_rgba(56,84,50,0.18)]">
                      {step.diagram}
                    </div>

                    <h3 className="font-display text-display-sm font-semibold text-ink tracking-tight mb-3 leading-snug">
                      {step.title}
                    </h3>

                    <p className="text-body-sm text-ink-secondary leading-[1.7]">
                      {step.description}
                    </p>

                    {/* Accent rule */}
                    <div className={`mt-5 h-0.5 w-12 rounded-full ${a.bar} opacity-60`} />
                  </article>
                </AnimateIn>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
