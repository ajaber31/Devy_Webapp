'use client'

import { useRef, useEffect, useState } from 'react'
import { SendHorizonal, Paperclip } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  value: string
  onChange: (val: string) => void
  onSend: () => void
  disabled?: boolean
}

export function ChatInput({ value, onChange, onSend, disabled }: ChatInputProps) {
  const ref = useRef<HTMLTextAreaElement>(null)
  // Track transition from empty → has content to trigger spring animation
  const [sendActive, setSendActive] = useState(false)
  const prevHasContent = useRef(false)

  useEffect(() => {
    const hasContent = !!value.trim() && !disabled
    if (hasContent && !prevHasContent.current) {
      // Just got content — trigger spring animation
      setSendActive(false)
      requestAnimationFrame(() => setSendActive(true))
    } else if (!hasContent) {
      setSendActive(false)
    }
    prevHasContent.current = hasContent
  }, [value, disabled])

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
    // Auto-grow
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
    if (value.trim() && !disabled) {
      onSend()
      if (ref.current) {
        ref.current.style.height = 'auto'
      }
    }
  }

  return (
    <div className="border-t border-border bg-canvas px-4 py-3">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end gap-2 bg-white border border-border rounded-card shadow-card focus-within:border-sage-400 focus-within:shadow-input-focus"
          style={{ transitionProperty: 'border-color, box-shadow', transitionDuration: '150ms' }}>
          {/* Attach button */}
          <button
            type="button"
            className="flex-shrink-0 ml-3 mb-2.5 p-1.5 rounded text-ink-tertiary hover:text-ink-secondary focus-ring"
            style={{ transitionProperty: 'color', transitionDuration: '150ms' }}
            aria-label="Attach file"
          >
            <Paperclip size={16} strokeWidth={1.75} />
          </button>

          {/* Textarea */}
          <textarea
            ref={ref}
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask about a child's needs, strategies, or resources…"
            rows={1}
            className="flex-1 resize-none bg-transparent py-2.5 text-body-sm text-ink placeholder:text-ink-tertiary focus:outline-none leading-relaxed"
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
            aria-label="Send message"
          >
            <SendHorizonal size={15} strokeWidth={2.5} />
          </button>
        </div>
        <p className="text-center text-body-xs text-ink-tertiary mt-2">
          ⌘ Enter to send · Answers cite their sources
        </p>
      </div>
    </div>
  )
}
