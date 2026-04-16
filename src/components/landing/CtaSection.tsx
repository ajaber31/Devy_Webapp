import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { NoiseTexture } from '@/components/shared/NoiseTexture'
import { AnimateIn } from '@/components/shared/AnimateIn'
import { getT } from '@/lib/i18n'
import type { Lang } from '@/lib/i18n'

export function CtaSection({ lang = 'en' }: { lang?: Lang }) {
  const t = getT(lang).landing.cta

  return (
    <section className="py-24 px-6">
      <AnimateIn>
        <div className="max-w-4xl mx-auto">
          <div
            className="relative rounded-card-lg overflow-hidden text-center px-8 py-16"
            style={{ background: 'linear-gradient(135deg, #3A5E30 0%, #5C8651 40%, #4F739F 100%)' }}
          >
            <NoiseTexture opacity={0.04} />

            {/* Decorative radial glow */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse 70% 60% at 50% 30%, rgba(255,255,255,0.1) 0%, transparent 60%)',
              }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse 50% 40% at 50% 100%, rgba(79,115,159,0.25) 0%, transparent 55%)',
              }}
            />

            <div className="relative z-10">
              <p className="text-body-sm font-medium text-sage-200 uppercase tracking-wider mb-4">{t.label}</p>
              <h2 className="font-display text-display-lg font-bold text-white tracking-tight mb-5">
                {t.heading}
              </h2>
              <p className="text-body-lg text-white/80 max-w-lg mx-auto mb-10 leading-relaxed">
                {t.description}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-sage-700 font-semibold text-body-base rounded-pill shadow-floating hover:bg-sage-50 active:scale-[0.98]"
                  style={{ transitionProperty: 'background-color, transform', transitionDuration: '150ms' }}
                >
                  {t.primary}
                  <ArrowRight size={16} strokeWidth={2.5} />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 text-white font-medium text-body-base rounded-pill border border-white/20 hover:bg-white/20"
                  style={{ transitionProperty: 'background-color', transitionDuration: '150ms' }}
                >
                  {t.secondary}
                </Link>
              </div>

              <p className="mt-8 text-body-xs text-white/50">
                {t.footnote}
              </p>
            </div>
          </div>
        </div>
      </AnimateIn>
    </section>
  )
}
