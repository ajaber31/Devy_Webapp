'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { useLanguage } from '@/components/shared/LanguageProvider'
import type { Lang } from '@/lib/i18n'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function CtaSection({ lang: _lang }: { lang?: Lang }) {
  const { t } = useLanguage()
  const copy = t.landing.cta

  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const sx = useSpring(mx, { stiffness: 80, damping: 22 })
  const sy = useSpring(my, { stiffness: 80, damping: 22 })
  const glow = useTransform([sx, sy], ([x, y]) => {
    const xn = typeof x === 'number' ? x : 0.5
    const yn = typeof y === 'number' ? y : 0.5
    return `radial-gradient(ellipse 70% 60% at ${xn * 100}% ${yn * 100}%, rgba(125,163,112,0.35) 0%, transparent 55%), radial-gradient(ellipse 50% 50% at ${(1 - xn) * 100}% ${(1 - yn) * 100}%, rgba(184,115,51,0.18) 0%, transparent 55%)`
  })

  function onMove(e: React.MouseEvent) {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width)
    my.set((e.clientY - r.top) / r.height)
  }

  return (
    <section className="py-24 px-6 bg-canvas">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-6xl mx-auto"
      >
        <div
          ref={ref}
          onMouseMove={onMove}
          className="relative rounded-[28px] overflow-hidden text-white"
          style={{
            background: 'linear-gradient(180deg, #0A1109 0%, #122116 100%)',
            boxShadow: '0 30px 100px -30px rgba(0,0,0,0.45), 0 8px 24px rgba(0,0,0,0.18)',
          }}
        >
          {/* Cursor-following glow */}
          <motion.div aria-hidden className="absolute inset-0 pointer-events-none" style={{ backgroundImage: glow, filter: 'blur(20px)' }} />

          {/* Grain */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none opacity-[0.20] mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Top hairline */}
          <div aria-hidden className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sage-300/60 to-transparent" />

          {/* Decorative grid */}
          <div aria-hidden className="absolute inset-0 pointer-events-none opacity-[0.06]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />

          <div className="relative z-10 px-8 md:px-16 py-20 md:py-28 grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill border border-sage-400/30 bg-sage-400/[0.08] text-body-xs font-display italic text-sage-200 mb-7">
                <span className="w-1.5 h-1.5 rounded-full bg-sage-300 animate-pulse" />
                {copy.label}
              </div>

              <h2 className="font-display font-bold tracking-[-0.035em] leading-[0.95] text-[clamp(2.5rem,7vw,5.5rem)] mb-6">
                {copy.heading.split('.').filter(Boolean).map((chunk, i, arr) => (
                  <span key={i} className="block">
                    {i === arr.length - 1
                      ? <em className="font-display italic text-sage-300">{chunk.trim()}.</em>
                      : <>{chunk.trim()}.</>
                    }
                  </span>
                ))}
              </h2>

              <p className="text-[1.125rem] text-white/65 max-w-2xl leading-[1.65]">
                {copy.description}
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col items-stretch gap-3 lg:items-end">
              <Link
                href="/signup"
                className="group relative inline-flex items-center justify-center gap-2 px-7 py-4 bg-white text-[#0E1A0D] font-semibold text-body-base rounded-pill overflow-hidden focus-ring"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-sage-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative">{copy.primary}</span>
                <ArrowRight size={16} strokeWidth={2.5} className="relative transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 text-white/85 font-medium text-body-base rounded-pill border border-white/15 hover:border-white/30 hover:bg-white/[0.04] transition-[background-color,border-color] duration-200"
              >
                {copy.secondary}
              </Link>
              <p className="text-body-xs text-white/40 mt-2 text-center lg:text-right font-display italic">
                {copy.footnote}
              </p>
            </div>
          </div>

          {/* Bottom hairline */}
          <div aria-hidden className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sand-400/30 to-transparent" />
        </div>
      </motion.div>
    </section>
  )
}
