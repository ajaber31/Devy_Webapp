'use client'

import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'
import { useLanguage } from '@/components/shared/LanguageProvider'
import type { Lang } from '@/lib/i18n'

type Accent = 'sage' | 'dblue' | 'sand'

const ACCENT: Record<Accent, { tint: string; bar: string; ring: string; mark: string }> = {
  sage: {
    tint: 'bg-gradient-to-br from-white via-white to-sage-50/70',
    bar: 'from-sage-400 via-sage-300 to-transparent',
    ring: 'group-hover:shadow-[0_8px_40px_-12px_rgba(92,134,81,0.32)]',
    mark: 'text-sage-300',
  },
  dblue: {
    tint: 'bg-gradient-to-br from-white via-white to-dblue-50/70',
    bar: 'from-dblue-400 via-dblue-300 to-transparent',
    ring: 'group-hover:shadow-[0_8px_40px_-12px_rgba(79,115,159,0.32)]',
    mark: 'text-dblue-300',
  },
  sand: {
    tint: 'bg-gradient-to-br from-white via-white to-sand-100/60',
    bar: 'from-sand-400 via-sand-300 to-transparent',
    ring: 'group-hover:shadow-[0_8px_40px_-12px_rgba(184,115,51,0.30)]',
    mark: 'text-sand-300',
  },
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function TestimonialsSection({ lang: _lang }: { lang?: Lang }) {
  const { t } = useLanguage()
  const copy = (t.landing as unknown as { testimonials: {
    eyebrow: string
    heading: string
    description: string
    items: { quote: string; author: string; role: string; accent: Accent }[]
    sourcesLabel: string
    sources: string[]
  } }).testimonials

  // Duplicate the sources array for an infinite marquee
  const marqueeList = [...copy.sources, ...copy.sources]

  return (
    <section id="testimonials" className="relative py-28 bg-[#FBF8F1] overflow-hidden">
      {/* Atmospheric blobs */}
      <div aria-hidden className="absolute top-10 left-1/3 w-[480px] h-[320px] pointer-events-none opacity-60"
        style={{ background: 'radial-gradient(ellipse at top, rgba(92,134,81,0.10) 0%, transparent 60%)', filter: 'blur(40px)' }} />
      <div aria-hidden className="absolute bottom-10 right-1/4 w-[420px] h-[280px] pointer-events-none opacity-60"
        style={{ background: 'radial-gradient(ellipse at bottom, rgba(79,115,159,0.08) 0%, transparent 60%)', filter: 'blur(40px)' }} />

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Folio header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-between mb-12 text-ink-tertiary"
        >
          <div className="flex items-center gap-3">
            <span className="font-display italic text-body-sm">§</span>
            <span className="font-display italic text-body-xs tracking-[0.18em] uppercase">V · {copy.eyebrow}</span>
            <span className="hidden sm:block h-px w-24 bg-border" />
          </div>
          <span className="font-display italic text-body-xs tracking-wider">pp. 05</span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-6 gap-x-10 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7"
          >
            <h2 className="font-display font-bold text-ink tracking-[-0.03em] leading-[1.0] text-[clamp(2.25rem,5vw,3.75rem)]">
              {copy.heading.split(' ').slice(0, -2).join(' ')}{' '}
              <em className="font-display italic text-sage-700">{copy.heading.split(' ').slice(-2).join(' ')}</em>
            </h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 lg:pt-3 text-body-lg text-ink-secondary font-display italic leading-relaxed"
          >
            {copy.description}
          </motion.p>
        </div>

        {/* Masonry-ish grid: alternating heights via translate */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {copy.items.map((item, i) => {
            const a = ACCENT[item.accent]
            const offset = i % 2 === 0 ? 'lg:translate-y-0' : 'lg:translate-y-8'
            return (
              <motion.article
                key={item.author}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.75, delay: i * 0.09, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4 }}
                className={`group relative rounded-card-lg border border-border/70 ${a.tint} p-6 flex flex-col shadow-card transition-shadow duration-300 ${a.ring} ${offset}`}
              >
                {/* Top accent bar */}
                <div aria-hidden className={`absolute top-0 left-6 right-6 h-px bg-gradient-to-r ${a.bar}`} />

                <Quote size={28} className={`${a.mark} mb-4`} strokeWidth={1.2} />

                <p className="font-display text-ink text-[1.02rem] leading-[1.55] mb-6 flex-1">
                  &ldquo;{item.quote}&rdquo;
                </p>

                <div className="pt-4 border-t border-border/60 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sage-200 to-sage-400 flex items-center justify-center font-display italic text-white text-body-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
                    {item.author.split(' ').map((p) => p[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-display font-semibold text-ink text-body-sm leading-tight truncate">{item.author}</p>
                    <p className="text-body-xs text-ink-tertiary font-display italic leading-tight truncate">{item.role}</p>
                  </div>
                </div>
              </motion.article>
            )
          })}
        </div>

        {/* Sources marquee */}
        <div className="mt-24 relative">
          <div className="flex items-center gap-4 mb-6">
            <span className="font-display italic text-body-xs tracking-[0.18em] uppercase text-ink-tertiary whitespace-nowrap">
              {copy.sourcesLabel}
            </span>
            <span className="flex-1 h-px bg-border/70" />
          </div>

          <div
            className="relative overflow-hidden"
            style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)' }}
          >
            <div className="flex gap-10 animate-marquee w-max">
              {marqueeList.map((src, i) => (
                <div key={`${src}-${i}`} className="flex items-center gap-3 flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-sage-400/50" />
                  <span className="font-display italic text-[1.15rem] text-ink-secondary whitespace-nowrap tracking-tight">
                    {src}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee { animation: marquee 38s linear infinite; }
      `}</style>
    </section>
  )
}
