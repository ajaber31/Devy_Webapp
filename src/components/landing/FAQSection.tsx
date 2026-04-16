'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { AnimateIn } from '@/components/shared/AnimateIn'
import { getT } from '@/lib/i18n'
import type { Lang } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface FAQItemProps {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
  index: number
}

function FAQItem({ question, answer, isOpen, onToggle, index }: FAQItemProps) {
  return (
    <AnimateIn delay={index * 60}>
      <div
        className={cn(
          'border rounded-card-lg overflow-hidden',
          isOpen ? 'border-sage-200 shadow-card' : 'border-border',
        )}
        style={{ transitionProperty: 'border-color, box-shadow', transitionDuration: '200ms' }}
      >
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-surface focus-ring rounded-card-lg"
          style={{ transitionProperty: 'background-color', transitionDuration: '150ms' }}
          aria-expanded={isOpen}
        >
          <span className="font-display text-[1.05rem] font-semibold text-ink tracking-[-0.01em]">
            {question}
          </span>
          <span
            className={cn(
              'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center',
              isOpen
                ? 'bg-sage-100 text-sage-600'
                : 'bg-raised text-ink-tertiary',
            )}
            style={{ transitionProperty: 'background-color, color', transitionDuration: '150ms' }}
          >
            {isOpen ? <Minus size={14} strokeWidth={2.5} /> : <Plus size={14} strokeWidth={2.5} />}
          </span>
        </button>

        <div
          className={cn(
            'overflow-hidden',
            isOpen ? 'max-h-96' : 'max-h-0',
          )}
          style={{ transitionProperty: 'max-height', transitionDuration: '250ms', transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
          aria-hidden={!isOpen}
        >
          <p className="px-6 pb-5 text-body-sm text-ink-secondary leading-relaxed">
            {answer}
          </p>
        </div>
      </div>
    </AnimateIn>
  )
}

export function FAQSection({ lang = 'en' }: { lang?: Lang }) {
  const t = getT(lang).landing.faq
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i)

  return (
    <section id="faq" className="py-24 bg-canvas">
      <div className="max-w-3xl mx-auto px-6">
        <AnimateIn className="text-center mb-14">
          <p className="text-body-sm font-medium text-sage-600 uppercase tracking-wider mb-3">{t.label}</p>
          <h2 className="font-display text-display-lg font-bold text-ink tracking-tight mb-4">
            {t.heading}
          </h2>
          <p className="text-body-lg text-ink-secondary max-w-xl mx-auto">
            {t.description}
          </p>
        </AnimateIn>

        <div className="space-y-3">
          {t.items.map((item, i) => (
            <FAQItem
              key={i}
              question={item.q}
              answer={item.a}
              isOpen={openIndex === i}
              onToggle={() => toggle(i)}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
