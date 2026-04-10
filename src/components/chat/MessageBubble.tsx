'use client'

import { AlertCircle } from 'lucide-react'
import { ResearchBadge } from './ResearchBadge'
import type { Message } from '@/lib/types'

interface MessageBubbleProps {
  message: Message
  isStreaming?: boolean
}

export function MessageBubble({ message, isStreaming = false }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end animate-fade-up">
        <div className="max-w-[75%] bg-sage-500 text-white rounded-card rounded-br-sm px-4 py-3 shadow-button text-body-sm leading-relaxed">
          {message.content}
        </div>
      </div>
    )
  }

  // Format assistant content — handle **bold**
  const formatContent = (text: string) => {
    const lines = text.split('\n')
    return lines.map((line, i) => {
      if (!line.trim()) return <div key={i} className="h-2" />

      // Bold text with **
      const parts = line.split(/(\*\*[^*]+\*\*)/)
      const formatted = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className="font-semibold text-ink">{part.slice(2, -2)}</strong>
        }
        return part
      })

      // List items
      if (line.startsWith('- ') || line.match(/^\d+\. /)) {
        return (
          <div key={i} className="flex gap-2 mb-1">
            <span className="text-sage-500 flex-shrink-0 mt-0.5">
              {line.startsWith('- ') ? '·' : line.match(/^(\d+)\./)?.[1] + '.'}
            </span>
            <span>{formatted.slice(line.startsWith('- ') ? 1 : 1)}</span>
          </div>
        )
      }

      return <p key={i} className="mb-2 last:mb-0">{formatted}</p>
    })
  }

  return (
    <div className="flex justify-start animate-fade-up">
      <div className="max-w-[80%] space-y-2.5">
        {/* Main message */}
        <div className="bg-surface rounded-card rounded-bl-sm px-4 py-3.5 shadow-card text-body-sm text-ink leading-relaxed border border-border/40">
          {/* While streaming with no content yet — show inline dots */}
          {isStreaming && !message.content ? (
            <div className="flex items-center gap-1.5 h-5">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-ink-tertiary animate-bounce-dot"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-0.5">
              {formatContent(message.content)}
              {/* Blinking cursor while tokens are arriving */}
              {isStreaming && (
                <span
                  className="inline-block w-[2px] h-[1.1em] bg-sage-400 rounded-full ml-0.5 align-middle"
                  style={{ animation: 'pulse 1s ease-in-out infinite' }}
                />
              )}
            </div>
          )}
        </div>

        {/* Research trust badge */}
        {message.sources && message.sources.length > 0 && (
          <ResearchBadge
            hasPubMed={message.sources.some(s => s.id.startsWith('pubmed-'))}
          />
        )}

        {/* Not found note */}
        {message.notFoundNote && (
          <div className="flex items-start gap-2.5 px-3 py-2.5 bg-sand-100/60 border border-sand-200 rounded-card">
            <AlertCircle size={14} className="text-sand-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
            <p className="text-body-xs text-ink-secondary leading-relaxed italic">{message.notFoundNote}</p>
          </div>
        )}
      </div>
    </div>
  )
}
