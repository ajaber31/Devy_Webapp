'use client'

import { useRef, useEffect, useState } from 'react'
import { SendHorizonal, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/components/shared/LanguageProvider'

interface ChatInputProps {
  value: string
  onChange: (val: string) => void
  onSend: () => void
  disabled?: boolean
  limitReached?: boolean
  onLimitClick?: () => void
}

export function ChatInput({ value, onChange, onSend, disabled, limitReached, onLimitClick }: ChatInputProps) {
  const { t } = useLanguage()
  const ref = useRef<HTMLTextAreaElement>(null)
  const [sendActive, setSendActive] = useState(false)
  const prevHasContent = useRef(false)

  useEffect(() => {
    const hasContent = !!value.trim() && !disabled
    if (hasContent && !prevHasContent.current) {
      setSendActive(false)
      requestAnimationFrame(() => setSendActive(true))
    } else if (!hasContent) {
      setSendActive(false)
    }
    prevHasContent.current = hasContent
  }, [value, disabled])

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = Math.min(ref.current.scrollHeight, 160) + 'px'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && value.trim()) {
      e.preventDefault()
      onSend()
    }
  }

  const handleSend = () => {
    if (limitReached) {
      onLimitClick?.()
      return
    }
    if (value.trim() && !disabled) {
      onSend()
      if (ref.current) {
        ref.current.style.height = 'auto'
      }
    }
  }

  // Limit reached state
  if (limitReached) {
    return (
      <div className="border-t border-border bg-canvas px-4 py-3">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => onLimitClick?.()}
            className="w-full flex items-center justify-center gap-2.5 py-3 rounded-card border border-sand-200 bg-sand-50 text-sand-600 hover:bg-sand-100 focus-ring"
            style={{ transitionProperty: 'background-color', transitionDuration: '150ms' }}
          >
            <Zap size={15} strokeWidth={2.5} className="flex-shrink-0" />
            <span className="text-body-sm font-medium">{t.chat.limitDisabledHint}</span>
            <span className="text-body-xs text-sand-400">— {t.chat.upgradeCta}</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="border-t border-border bg-canvas px-4 py-3">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end gap-2 bg-white border border-border rounded-card shadow-card focus-within:border-sage-400 focus-within:shadow-input-focus"
          style={{ transitionProperty: 'border-color, box-shadow', transitionDuration: '150ms' }}>
          {/* Textarea */}
          <textarea
            ref={ref}
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={t.chat.inputPlaceholder}
            rows={1}
            className="flex-1 resize-none bg-transparent py-2.5 pl-3 text-body-sm text-ink placeholder:text-ink-tertiary focus:outline-none leading-relaxed"
            style={{ minHeight: '40px', maxHeight: '160px' }}
            disabled={disabled}
          />

          {/* Send button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!value.trim() || disabled}
            className={cn(
              'flex-shrink-0 mr-2 mb-2 w-8 h-8 rounded-full flex items-center justify-center focus-ring',
              value.trim() && !disabled
                ? 'bg-sage-500 text-white hover:bg-sage-600 shadow-button hover:shadow-button-hover active:scale-95'
                : 'bg-raised text-ink-tertiary cursor-not-allowed'
            )}
            style={{
              transitionProperty: 'background-color, box-shadow, transform',
              transitionDuration: '150ms',
              animation: sendActive ? 'sendSpring 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' : undefined,
            }}
            aria-label={t.chat.send}
          >
            <SendHorizonal size={15} strokeWidth={2.5} />
          </button>
        </div>
        <p className="text-center text-body-xs text-ink-tertiary mt-2">
          {t.chat.sendHint}
        </p>
      </div>
    </div>
  )
}
