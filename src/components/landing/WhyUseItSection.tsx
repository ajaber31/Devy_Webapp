import { ShieldCheck, BookOpen, MessageSquare, Clock, Users, Layers } from 'lucide-react'
import { AnimateIn } from '@/components/shared/AnimateIn'
import { NoiseTexture } from '@/components/shared/NoiseTexture'
import { getT } from '@/lib/i18n'
import type { Lang } from '@/lib/i18n'

/**
 * "Clinical Editorial" magazine spread — one lead feature sized like a cover story,
 * five supporting features laid out in an asymmetric grid with Lora italic categories,
 * citation superscripts on emphatic words, and warm paper background.
 */
export function WhyUseItSection({ lang = 'en' }: { lang?: Lang }) {
  const t = getT(lang).landing.whyDevy

  // Six features — the first becomes the lead. Order matters.
  const features = [
    {
      icon: ShieldCheck,
      category: lang === 'fr' ? 'Fondation' : 'Foundation',
      title: t.feature1Title,
      description: t.feature1Desc,
      accent: 'sage',
      lead: true,
    },
    {
      icon: BookOpen,
      category: lang === 'fr' ? 'Méthode' : 'Method',
      title: t.feature2Title,
      description: t.feature2Desc,
      accent: 'dblue',
    },
    {
      icon: MessageSquare,
      category: lang === 'fr' ? 'Usage' : 'Practice',
      title: t.feature3Title,
      description: t.feature3Desc,
      accent: 'sand',
    },
    {
      icon: Clock,
      category: lang === 'fr' ? 'Accès' : 'Access',
      title: t.feature4Title,
      description: t.feature4Desc,
      accent: 'sage',
    },
    {
      icon: Layers,
      category: lang === 'fr' ? 'Échelle' : 'Scale',
      title: t.feature5Title,
      description: t.feature5Desc,
      accent: 'dblue',
    },
    {
      icon: Users,
      category: lang === 'fr' ? 'Posture' : 'Posture',
      title: t.feature6Title,
      description: t.feature6Desc,
      accent: 'sand',
    },
  ]

  const lead = features[0]
  const rest = features.slice(1)

  const accentDot: Record<string, string> = {
    sage:  'bg-sage-500',
    dblue: 'bg-dblue-500',
    sand:  'bg-sand-500',
  }
  const accentBg: Record<string, string> = {
    sage:  'bg-sage-100 text-sage-700',
    dblue: 'bg-dblue-100 text-dblue-700',
    sand:  'bg-sand-100 text-sand-600',
  }
  const accentBorder: Record<string, string> = {
    sage:  'border-l-sage-400',
    dblue: 'border-l-dblue-400',
    sand:  'border-l-sand-400',
  }

  const LeadIcon = lead.icon

  return (
    <section className="relative py-28 bg-canvas overflow-hidden">
      {/* Subtle warm wash to distinguish from HowItWorks */}
      <div aria-hidden className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #FBF8F1 50%, #FFFFFF 100%)' }} />
      <NoiseTexture opacity={0.025} />

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Folio / section marker */}
        <AnimateIn>
          <div className="flex items-center justify-between mb-14">
            <div className="flex items-center gap-3 text-ink-tertiary">
              <span className="font-display italic text-body-sm">§</span>
              <span className="font-display italic text-body-xs tracking-wider uppercase">II · {t.label}</span>
              <span className="hidden sm:block h-px w-24 bg-border" />
            </div>
            <span className="font-display italic text-body-xs text-ink-tertiary tracking-wider">
              pp. 02
            </span>
          </div>
        </AnimateIn>

        {/* Heading — asymmetric pullquote style */}
        <div className="mb-16">
          <AnimateIn>
            <h2 className="font-display font-bold text-ink tracking-tight leading-[0.98] text-[clamp(2.5rem,5.5vw,4.25rem)] max-w-3xl">
              {t.heading.replace('.', '')}
              <span className="text-sand-500">.</span>
            </h2>
          </AnimateIn>
          <AnimateIn delay={80} className="mt-6 max-w-xl">
            <p className="text-body-lg text-ink-secondary leading-relaxed font-display italic">
              {t.description}
            </p>
          </AnimateIn>
        </div>

        {/* Lead feature — magazine cover story */}
        <AnimateIn>
          <article className="relative mb-14 grid grid-cols-1 lg:grid-cols-12 gap-0 rounded-card-lg overflow-hidden bg-gradient-to-br from-sage-50 via-white to-[#FBF8F1] border border-sage-200/60 shadow-card">
            <NoiseTexture opacity={0.04} />
            {/* Left column — dominant quote */}
            <div className="lg:col-span-7 p-8 md:p-12 relative">
              <div className="flex items-center gap-2.5 mb-7">
                <span className="font-display italic text-body-xs tracking-wider uppercase text-sage-700">{lead.category}</span>
                <span className="h-px flex-1 max-w-[120px] bg-sage-300/70" />
                <span className="font-display italic text-body-xs text-sage-600">no. 01</span>
              </div>

              <h3 className="font-display font-semibold text-ink tracking-tight leading-[1.05] text-[clamp(1.75rem,3vw,2.5rem)] mb-5">
                {lead.title
                  .split(',')
                  .map((chunk, i, arr) => (
                    <span key={i}>
                      {i === 0 ? chunk : <em className="font-display italic text-sage-700">{chunk}</em>}
                      {i < arr.length - 1 && ','}
                    </span>
                  ))}
              </h3>

              <p className="text-body-md text-ink-secondary leading-[1.75] max-w-lg">
                {lead.description}
              </p>

              {/* Byline / signature strip */}
              <div className="mt-7 flex items-center gap-3 pt-5 border-t border-sage-200/60">
                <div className="w-8 h-8 rounded-full bg-sage-500 flex items-center justify-center">
                  <LeadIcon size={15} className="text-white" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <p className="text-body-xs font-display italic text-sage-800 leading-none">
                    {lang === 'fr' ? 'Ancré dans la recherche révisée par des pairs' : 'Grounded in peer-reviewed research'}
                  </p>
                  <p className="text-body-xs text-ink-tertiary leading-none mt-1">
                    {lang === 'fr' ? 'Base de connaissances + PubMed' : 'Knowledge Base + PubMed'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right column — decorative "article page" preview */}
            <div className="lg:col-span-5 bg-[#F6F1E5] p-8 md:p-10 relative border-l border-sand-200">
              <div className="font-display italic text-body-xs tracking-wider uppercase text-sand-600 mb-4">
                {lang === 'fr' ? 'Exemple de réponse' : 'Sample response'}
              </div>
              <div className="bg-white rounded-card p-5 border border-sand-200 shadow-[0_1px_0_rgba(0,0,0,0.03),0_8px_20px_-12px_rgba(56,84,50,0.18)]">
                <p className="font-display text-body-sm text-ink leading-relaxed mb-4">
                  &ldquo;{lang === 'fr'
                    ? 'La recherche soutient une approche multimodale : activités motrices intégrées aux routines, réduction des exigences en motricité fine…'
                    : 'Research supports a multi-modal approach: motor skill activities in daily routines, reduced fine-motor demands…'
                  }&rdquo;
                </p>
                <div className="pt-3 border-t border-border/60">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sage-50 border border-sage-200 rounded-pill">
                    <span className="w-1.5 h-1.5 rounded-full bg-sage-500" />
                    <span className="text-body-xs font-medium text-sage-700">
                      {lang === 'fr'
                        ? 'Ancré dans PubMed · recherche révisée par des pairs'
                        : 'Grounded in PubMed · peer-reviewed research'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Small editorial ornament */}
              <div aria-hidden className="mt-6 flex items-center gap-1.5 opacity-70">
                <div className="h-px flex-1 bg-sand-400/50" />
                <span className="font-display italic text-[10px] text-sand-600">❦</span>
                <div className="h-px flex-1 bg-sand-400/50" />
              </div>
            </div>
          </article>
        </AnimateIn>

        {/* Supporting features — asymmetric grid (2/3 split) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          {rest.map((feature, i) => {
            const Icon = feature.icon
            // Asymmetric: items 0, 3 span 3 cols; items 1, 2, 4 span 2 cols on lg
            const spanClass =
              i === 0 ? 'lg:col-span-3' :
              i === 3 ? 'lg:col-span-3' :
              'lg:col-span-2'
            return (
              <AnimateIn key={feature.title} delay={80 + i * 70} className={spanClass}>
                <article
                  className={`group h-full bg-white rounded-card p-6 border border-border/60 border-l-[3px] ${accentBorder[feature.accent]} shadow-card hover:shadow-card-hover`}
                  style={{ transitionProperty: 'box-shadow, transform', transitionDuration: '220ms', transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
                >
                  <div className="flex items-center gap-2.5 mb-4">
                    <span className="font-display italic text-body-xs tracking-wider uppercase text-ink-tertiary">
                      no. 0{i + 2}
                    </span>
                    <span className={`w-1 h-1 rounded-full ${accentDot[feature.accent]}`} />
                    <span className="font-display italic text-body-xs tracking-wider uppercase text-ink-secondary">
                      {feature.category}
                    </span>
                  </div>

                  <div className="flex items-start gap-4 mb-3">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-card ${accentBg[feature.accent]} flex items-center justify-center`}>
                      <Icon size={17} strokeWidth={1.75} />
                    </div>
                    <h3 className="font-display font-semibold text-ink tracking-tight leading-[1.2] text-[1.15rem]">
                      {feature.title}
                    </h3>
                  </div>

                  <p className="text-body-sm text-ink-secondary leading-[1.7]">
                    {feature.description}
                  </p>
                </article>
              </AnimateIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}
