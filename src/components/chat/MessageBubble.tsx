'use client'

import ReactMarkdown from 'react-markdown'
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
            <div className="prose-devy">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="font-display text-display-sm font-bold text-ink mt-3 mb-1.5 first:mt-0">{children}</h1>,
                  h2: ({ children }) => <h2 className="font-display text-[0.95rem] font-bold text-ink mt-3 mb-1.5 first:mt-0">{children}</h2>,
                  h3: ({ children }) => <h3 className="font-display text-[0.9rem] font-semibold text-ink mt-2.5 mb-1 first:mt-0">{children}</h3>,
                  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
                  em: ({ children }) => <em className="italic text-ink-secondary">{children}</em>,
                  ul: ({ children }) => <ul className="mb-2 last:mb-0 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="mb-2 last:mb-0 space-y-1 list-none">{children}</ol>,
                  li: ({ children }) => (
                    <li className="flex items-start gap-2">
                      <span className="text-sage-500 flex-shrink-0 mt-[0.2em] font-bold select-none text-[0.6rem]">●</span>
                      <span className="flex-1">{children}</span>
                    </li>
                  ),
                  hr: () => <hr className="my-3 border-border/60" />,
                  code: ({ children }) => (
                    <code className="px-1.5 py-0.5 bg-raised rounded text-body-xs font-mono text-ink border border-border/50">
                      {children}
                    </code>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-sage-300 pl-3 my-2 text-ink-secondary italic">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
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
