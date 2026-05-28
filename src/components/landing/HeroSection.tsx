'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Sparkles, BookOpen } from 'lucide-react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useLanguage } from '@/components/shared/LanguageProvider'
import type { Lang } from '@/lib/i18n'

type Exchange = {
  q: string
  aChunks: string[]
  sourceBadge: string
  sourceCount: number
}

const EXCHANGES_EN: Exchange[] = [
  {
    q: 'How do I support a 7-year-old with dyspraxia in the classroom?',
    aChunks: [
      'Research supports a multi-modal approach: ',
      'embedded motor activities, reduced fine-motor demands, ',
      'and explicit task sequencing. ',
      'Occupational therapy collaboration is strongly recommended.',
    ],
    sourceBadge: 'PubMed-grounded · peer-reviewed',
    sourceCount: 4,
  },
  {
    q: 'What does the evidence say about ABA for autism?',
    aChunks: [
      'Modern evidence supports naturalistic, ',
      'developmental, behavioral interventions (NDBIs) ',
      'over rigid ABA protocols, especially for young children. ',
      'Family-centered goals improve generalization.',
    ],
    sourceBadge: 'Cochrane · JAACAP · 6 sources',
    sourceCount: 6,
  },
  {
    q: 'Calming strategies for a child mid-meltdown?',
    aChunks: [
      'Lower demands and sensory input first — ',
      'co-regulate before you try to reason. ',
      'Once the nervous system settles, ',
      'name the feeling without judgment.',
    ],
    sourceBadge: 'KB · Polyvagal · 3 sources',
    sourceCount: 3,
  },
]

const EXCHANGES_FR: Exchange[] = [
  {
    q: 'Comment soutenir un enfant de 7 ans avec dyspraxie en classe?',
    aChunks: [
      'La recherche soutient une approche multimodale : ',
      'activités motrices intégrées, exigences réduites en motricité fine, ',
      'et séquençage explicite des tâches. ',
      "La collaboration en ergothérapie est fortement recommandée.",
    ],
    sourceBadge: 'Ancré dans PubMed · révisé par des pairs',
    sourceCount: 4,
  },
  {
    q: 'Que dit la recherche sur l’ABA pour l’autisme?',
    aChunks: [
      'Les données récentes soutiennent les interventions ',
      'naturalistes, développementales et comportementales (NDBIs) ',
      'plutôt que des protocoles ABA rigides, ',
      'surtout chez les jeunes enfants.',
    ],
    sourceBadge: 'Cochrane · JAACAP · 6 sources',
    sourceCount: 6,
  },
  {
    q: 'Stratégies d’apaisement pendant une crise?',
    aChunks: [
      'Réduisez d’abord les demandes et les stimuli. ',
      'Co-régulez avant de raisonner. ',
      'Une fois le système nerveux apaisé, ',
      'nommez l’émotion sans jugement.',
    ],
    sourceBadge: 'KB · Polyvagal · 3 sources',
    sourceCount: 3,
  },
]

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function HeroSection({ lang: _lang }: { lang?: Lang }) {
  const { t, lang } = useLanguage()
  const copy = t.landing.hero
  const exchanges = lang === 'fr' ? EXCHANGES_FR : EXCHANGES_EN

  const [exchangeIdx, setExchangeIdx] = useState(0)
  const [phase, setPhase] = useState<'asking' | 'thinking' | 'answering' | 'settled'>('asking')
  const [typedQ, setTypedQ] = useState('')
  const [revealedChunks, setRevealedChunks] = useState(0)
  const [showBadge, setShowBadge] = useState(false)

  const exchange = exchanges[exchangeIdx]

  // Type the question
  useEffect(() => {
    setTypedQ('')
    setRevealedChunks(0)
    setShowBadge(false)
    setPhase('asking')
    let i = 0
    const id = setInterval(() => {
      i++
      setTypedQ(exchange.q.slice(0, i))
      if (i >= exchange.q.length) {
        clearInterval(id)
        setTimeout(() => setPhase('thinking'), 350)
      }
    }, 28)
    return () => clearInterval(id)
  }, [exchangeIdx, exchange.q])

  // Thinking → answering
  useEffect(() => {
    if (phase !== 'thinking') return
    const id = setTimeout(() => setPhase('answering'), 1100)
    return () => clearTimeout(id)
  }, [phase])

  // Reveal answer chunks progressively
  useEffect(() => {
    if (phase !== 'answering') return
    if (revealedChunks >= exchange.aChunks.length) {
      const id = setTimeout(() => setShowBadge(true), 280)
      const next = setTimeout(() => setPhase('settled'), 700)
      return () => { clearTimeout(id); clearTimeout(next) }
    }
    const id = setTimeout(() => setRevealedChunks((n) => n + 1), 340)
    return () => clearTimeout(id)
  }, [phase, revealedChunks, exchange.aChunks.length])

  // Auto-advance to next exchange
  useEffect(() => {
    if (phase !== 'settled') return
    const id = setTimeout(() => setExchangeIdx((i) => (i + 1) % exchanges.length), 3400)
    return () => clearTimeout(id)
  }, [phase, exchanges.length])

  // Cursor-following gradient
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.2)
  const sx = useSpring(mx, { stiffness: 60, damping: 20 })
  const sy = useSpring(my, { stiffness: 60, damping: 20 })
  const bg = useTransform([sx, sy], ([x, y]) => {
    const xn = typeof x === 'number' ? x : 0.5
    const yn = typeof y === 'number' ? y : 0.2
    return `radial-gradient(ellipse 60% 50% at ${xn * 100}% ${yn * 100}%, rgba(125,163,112,0.30) 0%, transparent 55%), radial-gradient(ellipse 55% 60% at ${(1 - xn) * 100}% ${(1 - yn) * 100}%, rgba(79,115,159,0.22) 0%, transparent 50%), radial-gradient(ellipse 40% 40% at 90% 90%, rgba(184,115,51,0.10) 0%, transparent 55%)`
  })

  const sectionRef = useRef<HTMLElement>(null)
  function onMove(e: React.MouseEvent) {
    const el = sectionRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width)
    my.set((e.clientY - r.top) / r.height)
  }

  // Sample chips that rotate independently
  const chips = lang === 'fr'
    ? ['Soutien sensoriel', 'Objectifs PEI', 'Stratégies TDAH', 'Régulation', 'Lecture / dyslexie', 'Transitions']
    : ['Sensory support', 'IEP goals', 'ADHD strategies', 'Co-regulation', 'Reading / dyslexia', 'Transitions']

  return (
    <section
      ref={sectionRef}
      onMouseMove={onMove}
      className="relative min-h-[100svh] flex items-center overflow-hidden text-white"
      style={{
        background: 'linear-gradient(180deg, #0A1109 0%, #0E1A0D 45%, #122116 100%)',
      }}
    >
      {/* Cursor-following ambient gradient */}
      <motion.div aria-hidden className="absolute inset-0 pointer-events-none" style={{ backgroundImage: bg, filter: 'blur(20px)' }} />

      {/* Static grain */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.18] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Faint horizontal scan line top */}
      <div aria-hidden className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sage-400/40 to-transparent" />

      <div className="relative z-10 max-w-[1280px] mx-auto px-6 pt-32 pb-24 w-full grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-14 lg:gap-20 items-center">
        {/* Copy column */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill border border-sage-400/30 bg-sage-400/[0.06] backdrop-blur-sm text-body-xs font-medium text-sage-200 mb-8"
          >
            <span className="relative flex w-1.5 h-1.5">
              <span className="absolute inset-0 rounded-full bg-sage-300 animate-ping opacity-75" />
              <span className="relative w-1.5 h-1.5 rounded-full bg-sage-300" />
            </span>
            {copy.badge}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
            className="font-display font-bold leading-[0.95] tracking-[-0.035em] text-[clamp(2.75rem,7vw,5.75rem)] mb-7"
          >
            <span className="block text-white">{copy.headline1}</span>
            <span className="block text-white/80">{copy.headline2}{' '}
              <span className="relative inline-block">
                <em className="italic text-sage-300 not-italic-decoration">
                  <span className="relative z-10 italic">{copy.headline3}</span>
                </em>
                <span aria-hidden className="absolute left-0 right-0 -bottom-1 h-[5px] rounded-full bg-gradient-to-r from-sage-400/0 via-sage-400/80 to-sand-400/0 blur-[1px]" />
              </span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.18 }}
            className="text-[1.125rem] leading-[1.65] text-white/65 max-w-[36rem] mb-10 font-body"
          >
            {copy.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.28 }}
            className="flex flex-wrap items-center gap-3 mb-10"
          >
            <Link
              href="/signup"
              className="group relative inline-flex items-center gap-2 px-6 py-3.5 bg-white text-[#0E1A0D] font-semibold text-body-base rounded-pill overflow-hidden focus-ring"
              style={{ transition: 'transform 200ms cubic-bezier(0.16,1,0.3,1), box-shadow 200ms' }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-sage-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative">{copy.ctaPrimary}</span>
              <ArrowRight size={16} strokeWidth={2.5} className="relative transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-white/85 font-medium text-body-base rounded-pill border border-white/15 hover:border-white/30 hover:bg-white/[0.04] backdrop-blur-sm"
              style={{ transition: 'background-color 200ms, border-color 200ms' }}
            >
              {copy.ctaSecondary}
            </a>
          </motion.div>

          {/* Prompt chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.42 }}
            className="flex flex-wrap items-center gap-2"
          >
            <span className="text-body-xs text-white/40 font-display italic mr-1">{lang === 'fr' ? 'Essayez :' : 'Try:'}</span>
            {chips.map((c, i) => (
              <motion.span
                key={c}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.06, duration: 0.5 }}
                className="px-2.5 py-1 rounded-pill bg-white/[0.04] border border-white/10 text-body-xs text-white/70 backdrop-blur-sm cursor-default hover:bg-white/[0.08] hover:border-white/20 transition-colors"
              >
                {c}
              </motion.span>
            ))}
          </motion.div>
        </div>

        {/* Live chat demo */}
        <motion.div
          initial={{ opacity: 0, y: 30, rotateX: 6 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
          className="relative perspective-[1400px]"
        >
          {/* Glow halo */}
          <div aria-hidden className="absolute -inset-8 pointer-events-none opacity-70"
            style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(125,163,112,0.18) 0%, transparent 60%)', filter: 'blur(30px)' }} />

          {/* Window frame */}
          <div
            className="relative rounded-[20px] overflow-hidden border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl shadow-[0_20px_80px_-20px_rgba(0,0,0,0.6),0_4px_16px_rgba(125,163,112,0.08),inset_0_1px_0_rgba(255,255,255,0.06)]"
          >
            {/* Window chrome */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                <span className="w-2.5 h-2.5 rounded-full bg-sage-400/60" />
              </div>
              <div className="flex items-center gap-2 text-body-xs text-white/45 font-display italic">
                <Sparkles size={11} strokeWidth={2} className="text-sage-300" />
                {copy.mockHeader}
              </div>
              <div className="w-12" />
            </div>

            {/* Chat body */}
            <div className="px-6 py-7 min-h-[420px] space-y-5 bg-gradient-to-b from-transparent to-black/20">
              {/* Question bubble */}
              <div className="flex justify-end">
                <div className="max-w-[85%] bg-sage-500/85 text-white text-[0.95rem] leading-relaxed rounded-2xl rounded-br-md px-4 py-3 shadow-[0_4px_12px_rgba(92,134,81,0.35),inset_0_1px_0_rgba(255,255,255,0.12)]">
                  {typedQ}
                  {phase === 'asking' && <span className="inline-block w-[2px] h-[1em] bg-white/80 ml-0.5 align-middle animate-pulse" />}
                </div>
              </div>

              {/* Thinking */}
              {phase === 'thinking' && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-white/55"
                >
                  <div className="flex items-center gap-1 px-3 py-2 rounded-2xl rounded-bl-md bg-white/[0.06] border border-white/[0.08]">
                    <span className="w-1.5 h-1.5 rounded-full bg-sage-300 animate-bounce-dot" />
                    <span className="w-1.5 h-1.5 rounded-full bg-sage-300 animate-bounce-dot" style={{ animationDelay: '0.15s' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-sage-300 animate-bounce-dot" style={{ animationDelay: '0.3s' }} />
                  </div>
                  <span className="text-body-xs font-display italic">
                    {lang === 'fr' ? 'consulte la base de connaissances + PubMed…' : 'searching knowledge base + PubMed…'}
                  </span>
                </motion.div>
              )}

              {/* Answer */}
              {(phase === 'answering' || phase === 'settled') && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="max-w-[92%] space-y-3">
                    <div className="bg-white/[0.05] border border-white/[0.08] backdrop-blur-sm text-white/90 text-[0.95rem] leading-[1.7] rounded-2xl rounded-bl-md px-4 py-3.5">
                      {exchange.aChunks.map((chunk, i) => (
                        <motion.span
                          key={`${exchangeIdx}-${i}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: i < revealedChunks ? 1 : 0 }}
                          transition={{ duration: 0.35 }}
                        >
                          {chunk}
                        </motion.span>
                      ))}
                    </div>

                    {showBadge && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-sage-400/[0.12] border border-sage-400/30 text-body-xs font-medium text-sage-200"
                      >
                        <BookOpen size={11} strokeWidth={2.2} />
                        {exchange.sourceBadge}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input bar */}
            <div className="px-5 py-3 border-t border-white/[0.06] bg-white/[0.02] flex items-center gap-2">
              <div className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-pill px-4 py-2 text-body-sm text-white/35">
                {copy.mockPlaceholder}
              </div>
              <div className="w-9 h-9 rounded-full bg-sage-500 flex items-center justify-center flex-shrink-0 shadow-[0_4px_12px_rgba(92,134,81,0.4)]">
                <ArrowRight size={15} strokeWidth={2.5} className="text-white" />
              </div>
            </div>
          </div>

          {/* Floating exchange counter pill */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="absolute -top-3 -right-3 px-3 py-1.5 rounded-pill bg-[#0E1A0D] border border-white/15 text-body-xs font-display italic text-white/70 backdrop-blur-md flex items-center gap-2"
          >
            <span className="flex items-center gap-0.5">
              {exchanges.map((_, i) => (
                <span key={i} className={`w-1 h-1 rounded-full transition-colors ${i === exchangeIdx ? 'bg-sage-300' : 'bg-white/20'}`} />
              ))}
            </span>
            {lang === 'fr' ? 'exemples en direct' : 'live examples'}
          </motion.div>

          {/* Floating verified card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: showBadge ? 1 : 0.5, y: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute -bottom-5 -left-5 hidden md:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#0E1A0D]/95 border border-white/10 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="w-9 h-9 rounded-xl bg-sand-500/15 border border-sand-500/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-sand-400" viewBox="0 0 16 16" fill="none">
                <path d="M2 8L6 12L14 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-body-xs font-semibold text-white leading-tight">{copy.mockBadgeVerified}</p>
              <p className="text-body-xs text-white/45 leading-tight font-display italic">{copy.mockBadgePeer}</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom fade to next section */}
      <div aria-hidden className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none bg-gradient-to-b from-transparent to-canvas" />
    </section>
  )
}
