'use client'

import Link from 'next/link'
import { ArrowRight, UserPlus, MessageCircle, Sparkles } from 'lucide-react'
import { useLanguage } from '@/components/shared/LanguageProvider'

export function FirstRunBanner() {
  const { t } = useLanguage()
  const fr = t.dashboard.firstRun

  const steps = [
    {
      icon: UserPlus,
      label: fr.step1Label,
      description: fr.step1Desc,
      href: '/children',
      color: 'bg-sage-100 text-sage-600',
      number: '01',
    },
    {
      icon: MessageCircle,
      label: fr.step2Label,
      description: fr.step2Desc,
      href: '/chat',
      color: 'bg-dblue-100 text-dblue-600',
      number: '02',
    },
    {
      icon: Sparkles,
      label: fr.step3Label,
      description: fr.step3Desc,
      href: '/chat',
      color: 'bg-sand-100 text-sand-500',
      number: '03',
    },
  ]

  return (
    <div className="bg-white rounded-card-lg shadow-card border border-border/50 overflow-hidden">
      <div className="px-6 py-5 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-display text-[1.1rem] font-semibold text-ink tracking-tight">
            {fr.heading}
          </h3>
          <p className="text-body-xs text-ink-secondary mt-0.5">
            {fr.subheading}
          </p>
        </div>
        <Link
          href="/chat"
          className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-sage-500 text-white text-body-xs font-semibold rounded-pill shadow-button hover:bg-sage-600 active:scale-[0.98]"
          style={{ transitionProperty: 'background-color, transform', transitionDuration: '150ms' }}
        >
          {fr.skip}
          <ArrowRight size={13} strokeWidth={2.5} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/50">
        {steps.map((step) => {
          const Icon = step.icon
          return (
            <Link
              key={step.number}
              href={step.href}
              className="flex items-start gap-4 px-6 py-5 hover:bg-surface group"
              style={{ transitionProperty: 'background-color', transitionDuration: '150ms' }}
            >
              <div className="relative flex-shrink-0">
                <div className={`w-10 h-10 rounded-card ${step.color} flex items-center justify-center group-hover:scale-105`}
                  style={{ transitionProperty: 'transform', transitionDuration: '200ms', transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                  <Icon size={18} strokeWidth={1.75} />
                </div>
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-canvas border border-border text-[0.6rem] font-bold text-ink-tertiary flex items-center justify-center">
                  {step.number.slice(1)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-body-sm font-semibold text-ink group-hover:text-sage-700 mb-0.5"
                  style={{ transitionProperty: 'color', transitionDuration: '150ms' }}>
                  {step.label}
                </p>
                <p className="text-body-xs text-ink-secondary leading-relaxed">{step.description}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
