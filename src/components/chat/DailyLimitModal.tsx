'use client'

import Link from 'next/link'
import { X, Zap, Clock, ArrowRight } from 'lucide-react'
import { useLanguage } from '@/components/shared/LanguageProvider'

interface DailyLimitModalProps {
  limit: number
  planId: string
  resetTimeText: string
  onClose: () => void
}

export function DailyLimitModal({ limit, planId, resetTimeText, onClose }: DailyLimitModalProps) {
  const { t } = useLanguage()
  const c = t.chat

  const bodyText = c.limitReachedBody.replace('{limit}', String(limit))

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="limit-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-card-lg shadow-floating border border-border max-w-md w-full p-7 animate-fade-up"
        style={{ animationDuration: '200ms' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-md text-ink-tertiary hover:text-ink hover:bg-raised focus-ring"
          style={{ transitionProperty: 'color, background-color', transitionDuration: '150ms' }}
          aria-label={t.common.close}
        >
          <X size={16} strokeWidth={2} />
        </button>

        {/* Icon */}
        <div className="w-12 h-12 rounded-full bg-sand-100 text-sand-500 flex items-center justify-center mb-5">
          <Zap size={22} strokeWidth={1.75} />
        </div>

        {/* Heading */}
        <h2 id="limit-modal-title" className="font-display text-display-sm font-bold text-ink tracking-tight mb-2">
          {c.limitReachedTitle}
        </h2>
        <p className="text-body-sm text-ink-secondary mb-1">{bodyText}</p>

        {/* Reset time */}
        <div className="flex items-center gap-2 text-body-xs text-ink-tertiary mb-7">
          <Clock size={13} strokeWidth={2} className="flex-shrink-0" />
          <span>
            {c.limitResetTime}
            {resetTimeText && <span className="font-medium text-ink-secondary"> ({resetTimeText})</span>}
          </span>
        </div>

        {/* CTA */}
        {planId !== 'professional' && (
          <Link
            href="/settings?tab=billing"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-sage-500 text-white font-semibold text-body-sm rounded-pill shadow-button hover:bg-sage-600 active:scale-[0.98] focus-ring mb-3"
            style={{ transitionProperty: 'background-color, transform', transitionDuration: '150ms' }}
          >
            <Zap size={15} strokeWidth={2.5} />
            {c.upgradeCta}
            <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
        )}

        <button
          onClick={onClose}
          className="w-full flex items-center justify-center px-5 py-2.5 bg-surface border border-border rounded-pill text-body-sm font-medium text-ink-secondary hover:bg-raised focus-ring"
          style={{ transitionProperty: 'background-color', transitionDuration: '150ms' }}
        >
          {t.common.close}
        </button>
      </div>
    </div>
  )
}
