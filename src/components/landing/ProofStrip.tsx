'use client'

import { motion } from 'framer-motion'
import { ShieldCheck, BookOpenCheck, FlaskConical, Stethoscope } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '@/components/shared/LanguageProvider'
import type { Lang } from '@/lib/i18n'

const BADGE_ICONS = [ShieldCheck, BookOpenCheck, FlaskConical, Stethoscope]

function useCountUp(target: string, inView: boolean) {
  const [display, setDisplay] = useState(target)

  useEffect(() => {
    const match = target.match(/^([\d\s, ]+)([^\d]*)$/)
    if (!inView || !match) {
      setDisplay(target)
      return
    }
    const raw = match[1].replace(/[\s, ]/g, '')
    const num = parseInt(raw, 10)
    const suffix = match[2]
    if (Number.isNaN(num)) {
      setDisplay(target)
      return
    }
    const duration = 1400
    const start = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      const v = Math.round(num * eased)
      const formatted = num >= 1000 ? v.toLocaleString() : String(v)
      setDisplay(formatted + suffix)
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, target])

  return display
}

function StatItem({ value, label, inView, delay }: { value: string; label: string; inView: boolean; delay: number }) {
  const display = useCountUp(value, inView)
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-baseline gap-3"
    >
      <span className="font-display font-bold text-[2.5rem] md:text-[3rem] leading-none tracking-[-0.04em] text-ink tabular-nums">
        {display}
      </span>
      <span className="text-body-sm text-ink-secondary font-display italic max-w-[14ch] leading-tight">
        {label}
      </span>
    </motion.div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ProofStrip({ lang: _lang }: { lang?: Lang }) {
  const { t } = useLanguage()
  const copy = (t.landing as unknown as { proof: {
    eyebrow: string
    heading: string
    partnerLabel: string
    partnerName: string
    partnerCaption: string
    badges: { title: string; caption: string }[]
    stats: { value: string; label: string }[]
  } }).proof

  const ref = useRef<HTMLElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ob = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); ob.disconnect() }
    }, { threshold: 0.25 })
    ob.observe(el)
    return () => ob.disconnect()
  }, [])

  return (
    <section ref={ref} className="relative bg-canvas py-20 overflow-hidden">
      {/* Top hairline */}
      <div aria-hidden className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sage-300/40 to-transparent" />

      <div className="max-w-6xl mx-auto px-6">
        {/* Eyebrow + heading row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-8 gap-x-10 mb-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5"
          >
            <div className="flex items-center gap-2 text-ink-tertiary mb-3">
              <span className="font-display italic text-body-sm">§</span>
              <span className="font-display italic text-body-xs tracking-[0.18em] uppercase">{copy.eyebrow}</span>
            </div>
            <h2 className="font-display font-semibold text-ink tracking-[-0.02em] leading-[1.05] text-[clamp(1.5rem,2.6vw,2.1rem)]">
              {copy.heading}
            </h2>
          </motion.div>

          {/* Partner card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7"
          >
            <div className="relative rounded-card-lg bg-white border border-border/70 p-6 md:p-7 flex items-center gap-6 shadow-card overflow-hidden group">
              {/* Glow */}
              <div aria-hidden className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: 'radial-gradient(circle, rgba(92,134,81,0.10) 0%, transparent 70%)' }} />

              <div className="flex-shrink-0">
                <div className="w-32 md:w-44 h-16 md:h-20 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/partners/centre-petits-genies.svg"
                    alt="Centre pour les Petits Génies — Fondation Sami Fruits"
                    className="absolute inset-0 w-full h-full object-contain object-left"
                  />
                </div>
              </div>

              <div className="flex-1 min-w-0 border-l border-border pl-6">
                <p className="font-display italic text-body-xs tracking-[0.18em] uppercase text-sage-700 mb-1">
                  {copy.partnerLabel}
                </p>
                <p className="font-display font-semibold text-ink text-[1.05rem] leading-tight tracking-tight">
                  {copy.partnerName}
                </p>
                <p className="text-body-xs text-ink-tertiary mt-0.5">{copy.partnerCaption}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Badge row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-16">
          {copy.badges.map((b, i) => {
            const Icon = BADGE_ICONS[i % BADGE_ICONS.length]
            return (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 + i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -3 }}
                className="group relative p-4 rounded-card border border-border bg-white/80 backdrop-blur-sm flex items-start gap-3 hover:border-sage-300 hover:shadow-card transition-[border-color,box-shadow,transform] duration-200"
              >
                <div className="w-9 h-9 rounded-lg bg-sage-50 border border-sage-100 flex items-center justify-center flex-shrink-0 group-hover:bg-sage-100 transition-colors">
                  <Icon size={15} className="text-sage-700" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-body-sm font-semibold text-ink leading-snug">{b.title}</p>
                  <p className="text-body-xs text-ink-tertiary font-display italic mt-0.5 leading-snug">{b.caption}</p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Stat row */}
        <div className="relative rounded-card-lg bg-gradient-to-br from-sage-50/60 via-white to-canvas border border-sage-100/80 px-6 md:px-10 py-8 md:py-10">
          <div aria-hidden className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-sage-300/50 to-transparent" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10">
            {copy.stats.map((s, i) => (
              <StatItem key={s.label} value={s.value} label={s.label} inView={inView} delay={0.3 + i * 0.12} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
