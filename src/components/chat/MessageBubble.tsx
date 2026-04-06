'use client'

import { AlertCircle } from 'lucide-react'
import { SourceCitationCard } from './SourceCitationCard'
import type { Message } from '@/lib/types'

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
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
          <div className="space-y-0.5">
            {formatContent(message.content)}
          </div>
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-body-xs font-medium text-ink-tertiary px-0.5 flex items-center gap-1.5">
              <svg className="w-3 h-3 text-sage-500" viewBox="0 0 12 12" fill="none">
                <rect x="1" y="1" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M3.5 4.5H8.5M3.5 6.5H7M3.5 8.5H6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              Supporting sources
            </p>
            {message.sources.map(source => (
              <SourceCitationCard key={source.id} source={source} />
            ))}
          </div>
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
