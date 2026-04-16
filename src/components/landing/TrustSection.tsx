import { Lock, FileCheck, AlertCircle, ShieldCheck, FlaskConical, BookOpen } from 'lucide-react'
import { AnimateIn } from '@/components/shared/AnimateIn'
import { getT } from '@/lib/i18n'
import type { Lang } from '@/lib/i18n'

export function TrustSection({ lang = 'en' }: { lang?: Lang }) {
  const t = getT(lang).landing.trust

  const trustPoints = [
    { icon: Lock,       title: t.point1Title, description: t.point1Desc },
    { icon: FileCheck,  title: t.point2Title, description: t.point2Desc },
    { icon: AlertCircle,title: t.point3Title, description: t.point3Desc },
  ]

  const principles = [
    { icon: ShieldCheck, title: t.principle1Title, body: t.principle1Body },
    { icon: FlaskConical,title: t.principle2Title, body: t.principle2Body },
    { icon: BookOpen,    title: t.principle3Title, body: t.principle3Body },
  ]

  return (
    <section id="trust" className="py-24 bg-surface relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute top-0 right-0 w-[600px] h-[400px] pointer-events-none opacity-30"
        style={{
          background: 'radial-gradient(ellipse at right top, rgba(92,134,81,0.1) 0%, transparent 60%)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 w-[500px] h-[350px] pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(ellipse at left bottom, rgba(79,115,159,0.08) 0%, transparent 60%)',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6">
        <AnimateIn className="text-center mb-16">
          <p className="text-body-sm font-medium text-sage-600 uppercase tracking-wider mb-3">{t.label}</p>
          <h2 className="font-display text-display-lg font-bold text-ink tracking-tight mb-4">
            {t.heading}
          </h2>
          <p className="text-body-lg text-ink-secondary max-w-xl mx-auto">
            {t.description}
          </p>
        </AnimateIn>

        {/* Trust pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {trustPoints.map((point, i) => {
            const Icon = point.icon
            return (
              <AnimateIn key={point.title} delay={i * 100}>
                <div className="bg-white rounded-card-lg p-6 shadow-card border border-border/50 text-center h-full">
                  <div className="w-12 h-12 rounded-full bg-sage-100 text-sage-600 flex items-center justify-center mx-auto mb-4">
                    <Icon size={20} strokeWidth={1.75} />
                  </div>
                  <h3 className="font-display text-display-sm font-semibold text-ink mb-2">{point.title}</h3>
                  <p className="text-body-sm text-ink-secondary leading-relaxed">{point.description}</p>
                </div>
              </AnimateIn>
            )
          })}
        </div>

        {/* Design principles */}
        <AnimateIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {principles.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="bg-white rounded-card-lg p-6 shadow-card border border-border/50 flex flex-col gap-4">
                  <div className="w-10 h-10 rounded-card bg-sage-100 text-sage-600 flex items-center justify-center flex-shrink-0">
                    <Icon size={18} strokeWidth={1.75} />
                  </div>
                  <div>
                    <h4 className="font-display text-display-sm font-semibold text-ink mb-1.5">{item.title}</h4>
                    <p className="text-body-sm text-ink-secondary leading-relaxed">{item.body}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </AnimateIn>
      </div>
    </section>
  )
}
