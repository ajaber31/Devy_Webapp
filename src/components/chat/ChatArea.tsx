'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import { ExamplePrompts } from './ExamplePrompts'
import { ChatInput } from './ChatInput'
import { mockMessages, mockResponses } from '@/lib/mock-data/messages'
import type { Message } from '@/lib/types'
import { MoreHorizontal, Star } from 'lucide-react'

interface ChatAreaProps {
  conversationId: string
  conversationTitle: string
}

export function ChatArea({ conversationId, conversationTitle }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>(
    conversationId === 'c1' ? mockMessages : []
  )
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const responseIndex = useRef(0)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = () => {
    if (!input.trim() || isTyping) return

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      role: 'user',
      content: input.trim(),
      createdAt: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const response = mockResponses[responseIndex.current % mockResponses.length]
      responseIndex.current += 1
      const aiMsg: Message = {
        ...response,
        id: `ai-${Date.now()}`,
        conversationId,
        createdAt: new Date().toISOString(),
      }
      setMessages(prev => [...prev, aiMsg])
      setIsTyping(false)
    }, 1500)
  }

  const hasMessages = messages.length > 0

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      {/* Chat header */}
      <div className="h-14 flex items-center justify-between px-5 border-b border-border flex-shrink-0 bg-canvas">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-2 h-2 rounded-full bg-sage-400 flex-shrink-0" />
          <h2 className="font-display text-[1rem] font-semibold text-ink truncate">{conversationTitle}</h2>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button className="p-2 rounded text-ink-tertiary hover:text-ink hover:bg-raised focus-ring" style={{ transitionProperty: 'color, background-color', transitionDuration: '150ms' }} aria-label="Save conversation">
            <Star size={16} strokeWidth={1.75} />
          </button>
          <button className="p-2 rounded text-ink-tertiary hover:text-ink hover:bg-raised focus-ring" style={{ transitionProperty: 'color, background-color', transitionDuration: '150ms' }} aria-label="More options">
            <MoreHorizontal size={16} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Messages or empty state */}
      {hasMessages ? (
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        </div>
      ) : (
        <ExamplePrompts onSelect={setInput} />
      )}

      {/* Input */}
      <ChatInput
        value={input}
        onChange={setInput}
        onSend={handleSend}
        disabled={isTyping}
      />
    </div>
  )
}
