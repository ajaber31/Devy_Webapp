import { Lock, FileCheck, AlertCircle } from 'lucide-react'
import { AnimateIn } from '@/components/shared/AnimateIn'
import { NoiseTexture } from '@/components/shared/NoiseTexture'
import { getT } from '@/lib/i18n'
import type { Lang } from '@/lib/i18n'

/**
 * "Clinical Editorial" manifesto — dark sage "paper" reverse-out.
 * Three trust pillars as numbered editorial statements + three principles
 * as roman-numeral footnoted paragraphs. Feels like the masthead of a journal.
 */
export function TrustSection({ lang = 'en' }: { lang?: Lang }) {
  const t = getT(lang).landing.trust

  const trustPoints = [
    { icon: Lock,         title: t.point1Title, description: t.point1Desc, marker: '01' },
    { icon: FileCheck,    title: t.point2Title, description: t.point2Desc, marker: '02' },
    { icon: AlertCircle,  title: t.point3Title, description: t.point3Desc, marker: '03' },
  ]

  const principles = [
    { roman: 'I',   title: t.principle1Title, body: t.principle1Body },
    { roman: 'II',  title: t.principle2Title, body: t.principle2Body },
    { roman: 'III', title: t.principle3Title, body: t.principle3Body },
  ]

  return (
    <section id="trust" className="relative py-28 overflow-hidden text-white"
      style={{ background: 'linear-gradient(180deg, #2A3F26 0%, #385432 40%, #2F4A29 100%)' }}
    >
      <NoiseTexture opacity={0.055} />

      {/* Warm atmospheric glow — sand + sage */}
      <div aria-hidden className="absolute top-0 right-1/4 w-[720px] h-[480px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top, rgba(184,115,51,0.18) 0%, transparent 65%)', filter: 'blur(40px)' }} />
      <div aria-hidden className="absolute bottom-0 left-0 w-[640px] h-[420px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at bottom left, rgba(92,134,81,0.35) 0%, transparent 60%)', filter: 'blur(50px)' }} />

      {/* Top rule — like a journal masthead */}
      <div aria-hidden className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-sand-500 via-sage-300 to-sand-500 opacity-70" />

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Folio marker on dark */}
        <AnimateIn>
          <div className="flex items-center justify-between mb-14 text-sage-200/80">
            <div className="flex items-center gap-3">
              <span className="font-display italic text-body-sm">§</span>
              <span className="font-display italic text-body-xs tracking-wider uppercase">III · {t.label}</span>
              <span className="hidden sm:block h-px w-24 bg-sage-200/30" />
            </div>
            <span className="font-display italic text-body-xs tracking-wider">
              pp. 03
            </span>
          </div>
        </AnimateIn>

        {/* Manifesto heading — oversized, two-line italic emphasis */}
        <div className="mb-20 max-w-4xl">
          <AnimateIn>
            <h2 className="font-display font-bold tracking-tight leading-[0.96] text-[clamp(2.75rem,6vw,5rem)]">
              {/* Split by period to emphasize the second clause */}
              {t.heading.split(". ").map((chunk, i) => (
                <span key={i} className="block">
                  {i === 0 ? (
                    <>{chunk}.</>
                  ) : (
                    <em className="font-display italic text-sand-300">{chunk}</em>
                  )}
                </span>
              ))}
            </h2>
          </AnimateIn>
          <AnimateIn delay={120}>
            <p className="mt-8 text-body-lg text-sage-100/80 leading-relaxed font-display italic max-w-2xl">
              {t.description}
            </p>
          </AnimateIn>
        </div>

        {/* Three trust pillars — numbered editorial pull-quotes on warm paper */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {trustPoints.map((point, i) => {
            const Icon = point.icon
            return (
              <AnimateIn key={point.title} delay={i * 110}>
                <article className="relative h-full p-7 rounded-card-lg bg-[#F6F1E5] text-ink overflow-hidden group">
                  <NoiseTexture opacity={0.05} />
                  {/* Corner fold — decorative */}
                  <div aria-hidden className="absolute top-0 right-0 w-0 h-0"
                    style={{
                      borderTop: '28px solid rgba(184,115,51,0.22)',
                      borderLeft: '28px solid transparent',
                    }}
                  />

                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <span className="font-display italic text-sand-600 text-body-xs tracking-[0.18em]">
                        {lang === 'fr' ? `Engagement · ${point.marker}` : `Commitment · ${point.marker}`}
                      </span>
                      <div className="w-9 h-9 rounded-full border border-sage-400 flex items-center justify-center bg-white">
                        <Icon size={15} className="text-sage-700" strokeWidth={2} />
                      </div>
                    </div>

                    <h3 className="font-display font-semibold text-ink tracking-tight leading-[1.15] text-[1.35rem] mb-3">
                      {point.title}
                    </h3>
                    <p className="text-body-sm text-ink-secondary leading-[1.7]">
                      {point.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-sand-300/40 flex items-center justify-between">
                    <span className="font-display italic text-body-xs text-sand-600">
                      — Devy {lang === 'fr' ? 'Équipe clinique' : 'Clinical Team'}
                    </span>
                    <span className="w-6 h-6 rounded-full bg-sage-500 flex items-center justify-center font-display italic text-white text-[11px]">
                      {point.marker}
                    </span>
                  </div>
                </article>
              </AnimateIn>
            )
          })}
        </div>

        {/* Three principles — editorial roman-numeral paragraphs */}
        <AnimateIn>
          <div className="relative rounded-card-lg border border-sage-200/20 bg-white/[0.04] backdrop-blur-[2px] p-8 md:p-10">
            <div className="flex items-center gap-3 mb-8 text-sage-200/70">
              <span className="font-display italic text-body-xs tracking-wider uppercase">
                {lang === 'fr' ? 'Principes directeurs' : 'Guiding principles'}
              </span>
              <span className="flex-1 h-px bg-sage-200/15" />
              <span className="font-display italic text-body-xs tracking-wider">
                {lang === 'fr' ? 'appendice' : 'appendix'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
              {principles.map((p, i) => (
                <AnimateIn key={p.title} delay={i * 90}>
                  <div className="relative">
                    {/* Roman numeral drop-cap */}
                    <div className="flex items-baseline gap-3 mb-3">
                      <span className="font-display italic font-bold text-sand-300 text-[3rem] leading-none tracking-tighter">
                        {p.roman}
                      </span>
                      <span className="h-px flex-1 bg-sand-300/30 mb-2" />
                    </div>
                    <h4 className="font-display font-semibold tracking-tight leading-[1.2] text-[1.2rem] mb-3 text-white">
                      {p.title}
                    </h4>
                    <p className="text-body-sm text-sage-100/75 leading-[1.75]">
                      {p.body}
                    </p>
                  </div>
                </AnimateIn>
              ))}
            </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  )
}
