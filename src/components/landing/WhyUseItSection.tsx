import { ShieldCheck, BookOpen, MessageSquare, Clock, Users, Layers } from 'lucide-react'
import { AnimateIn } from '@/components/shared/AnimateIn'
import { getT } from '@/lib/i18n'
import type { Lang } from '@/lib/i18n'

const featureIcons = [ShieldCheck, BookOpen, MessageSquare, Clock, Users, Layers]

export function WhyUseItSection({ lang = 'en' }: { lang?: Lang }) {
  const t = getT(lang).landing.whyDevy

  const features = [
    { icon: featureIcons[0], title: t.feature1Title, description: t.feature1Desc },
    { icon: featureIcons[1], title: t.feature2Title, description: t.feature2Desc },
    { icon: featureIcons[2], title: t.feature3Title, description: t.feature3Desc },
    { icon: featureIcons[3], title: t.feature4Title, description: t.feature4Desc },
    { icon: featureIcons[4], title: t.feature5Title, description: t.feature5Desc },
    { icon: featureIcons[5], title: t.feature6Title, description: t.feature6Desc },
  ]

  return (
    <section className="py-24 bg-canvas">
      <div className="max-w-6xl mx-auto px-6">
        <AnimateIn className="text-center mb-16">
          <p className="text-body-sm font-medium text-sage-600 uppercase tracking-wider mb-3">{t.label}</p>
          <h2 className="font-display text-display-lg font-bold text-ink tracking-tight mb-4">
            {t.heading}
          </h2>
          <p className="text-body-lg text-ink-secondary max-w-xl mx-auto">
            {t.description}
          </p>
        </AnimateIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <AnimateIn key={feature.title} delay={i * 70}>
                <div
                  className="group flex gap-4 p-6 rounded-card-lg bg-white border border-border/60 shadow-card hover:shadow-card-hover h-full"
                  style={{
                    transitionProperty: 'box-shadow',
                    transitionDuration: '200ms',
                    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-card bg-sage-100 text-sage-600 flex items-center justify-center group-hover:bg-sage-200"
                    style={{ transitionProperty: 'background-color', transitionDuration: '200ms' }}
                  >
                    <Icon size={18} strokeWidth={1.75} />
                  </div>
                  <div>
                    <h3 className="font-display text-[1.05rem] font-semibold text-ink mb-2 tracking-[-0.01em]">
                      {feature.title}
                    </h3>
                    <p className="text-body-sm text-ink-secondary leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </AnimateIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}
