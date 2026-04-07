'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import { ExamplePrompts } from './ExamplePrompts'
import { ChatInput } from './ChatInput'
import { mockResponses } from '@/lib/mock-data/messages'
import { insertMessage, createConversation } from '@/lib/actions/conversations'
import type { Message, Conversation } from '@/lib/types'
import { MoreHorizontal, Star, ArrowUpRight } from 'lucide-react'

interface ChatAreaProps {
  // null = brand-new conversation not yet created in DB
  conversationId: string | null
  conversationTitle: string
  initialMessages: Message[]
  childId?: string
  childName?: string
  /** Called when a new conversation is auto-created on first send */
  onConversationCreated?: (conversation: Conversation) => void
}

export function ChatArea({
  conversationId: initialConversationId,
  conversationTitle,
  initialMessages,
  childId,
  childName,
  onConversationCreated,
}: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  // Track the actual conversation ID (may be set lazily on first send)
  const [convoId, setConvoId] = useState<string | null>(initialConversationId)
  const bottomRef = useRef<HTMLDivElement>(null)
  const responseIndex = useRef(0)

  // Sync if parent changes the active conversation
  useEffect(() => {
    setMessages(initialMessages)
    setConvoId(initialConversationId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = async () => {
    if (!input.trim() || isTyping) return

    const content = input.trim()
    setInput('')

    // Create conversation in DB on first send if one doesn't exist yet
    let activeConvoId = convoId
    if (!activeConvoId) {
      const result = await createConversation({
        title: content.slice(0, 60),
        childId,
      })
      if (result.error || !result.data) {
        console.error('Failed to create conversation:', result.error)
        return
      }
      activeConvoId = result.data.id
      setConvoId(activeConvoId)
      onConversationCreated?.(result.data)
    }

    // Optimistic user message
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      conversationId: activeConvoId,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])
    setIsTyping(true)

    // Persist user message
    await insertMessage({ conversationId: activeConvoId, role: 'user', content })

    // Mock AI response (replaced by real AI in next phase)
    setTimeout(async () => {
      const response = mockResponses[responseIndex.current % mockResponses.length]
      responseIndex.current += 1
      const aiMsg: Message = {
        ...response,
        id: `ai-${Date.now()}`,
        conversationId: activeConvoId!,
        createdAt: new Date().toISOString(),
      }
      setMessages(prev => [...prev, aiMsg])
      setIsTyping(false)

      // Persist AI message
      await insertMessage({
        conversationId: activeConvoId!,
        role: 'assistant',
        content: response.content,
        notFoundNote: response.notFoundNote,
      })
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
          <button
            className="p-2 rounded text-ink-tertiary hover:text-ink hover:bg-raised focus-ring"
            style={{ transitionProperty: 'color, background-color', transitionDuration: '150ms' }}
            aria-label="Save conversation"
          >
            <Star size={16} strokeWidth={1.75} />
          </button>
          <button
            className="p-2 rounded text-ink-tertiary hover:text-ink hover:bg-raised focus-ring"
            style={{ transitionProperty: 'color, background-color', transitionDuration: '150ms' }}
            aria-label="More options"
          >
            <MoreHorizontal size={16} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Child context banner */}
      {childId && childName && (
        <div className="flex items-center justify-between gap-3 px-5 py-2.5 bg-dblue-50 border-b border-dblue-200 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-dblue-200 text-dblue-700 flex items-center justify-center text-body-xs font-bold flex-shrink-0">
              {childName.charAt(0)}
            </div>
            <span className="text-body-xs text-dblue-700 font-medium">
              Conversation about <span className="font-semibold">{childName}</span>
            </span>
          </div>
          <Link
            href={`/children/${childId}`}
            className="flex items-center gap-1 text-body-xs text-dblue-600 hover:text-dblue-800 font-medium focus-ring rounded flex-shrink-0"
            style={{ transitionProperty: 'color', transitionDuration: '150ms' }}
          >
            View profile
            <ArrowUpRight size={12} strokeWidth={2} />
          </Link>
        </div>
      )}

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
        <ExamplePrompts onSelect={setInput} childName={childName} />
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
