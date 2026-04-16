'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import { ExamplePrompts } from './ExamplePrompts'
import { ChatInput } from './ChatInput'
import { DailyLimitModal } from './DailyLimitModal'
import { insertMessage, createConversation } from '@/lib/actions/conversations'
import { useLanguage } from '@/components/shared/LanguageProvider'
import type { Message, Conversation, Source } from '@/lib/types'
import { ArrowUpRight, PanelLeft } from 'lucide-react'

interface DailyLimitState {
  limit: number
  planId: string
  resetTimeText: string
}

interface ChatAreaProps {
  conversationId: string | null
  conversationTitle: string
  initialMessages: Message[]
  isLoading?: boolean
  childId?: string
  childName?: string
  onConversationCreated?: (conversation: Conversation) => void
  onMessageSent?: (conversationId: string, preview: string) => void
  onShowConversations?: () => void
}

export function ChatArea({
  conversationId: initialConversationId,
  conversationTitle,
  initialMessages,
  isLoading,
  childId,
  childName,
  onConversationCreated,
  onMessageSent,
  onShowConversations,
}: ChatAreaProps) {
  const { t } = useLanguage()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [streamingId, setStreamingId] = useState<string | null>(null)
  const [convoId, setConvoId] = useState<string | null>(initialConversationId)
  const [dailyLimit, setDailyLimit] = useState<DailyLimitState | null>(null)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const selfCreatedId = useRef<string | null>(null)
  const prevMessageCountRef = useRef(messages.length)

  // Sync when parent switches to a different conversation
  useEffect(() => {
    if (selfCreatedId.current !== null && initialConversationId === selfCreatedId.current) {
      selfCreatedId.current = null
      return
    }
    setMessages(initialMessages)
    setConvoId(initialConversationId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConversationId])

  // Auto-scroll: only when a new message is added or typing starts
  useEffect(() => {
    const newCount = messages.length
    if (newCount > prevMessageCountRef.current || isTyping) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    prevMessageCountRef.current = newCount
  }, [messages.length, isTyping])

  const isInputDisabled = isTyping || !!streamingId || !!dailyLimit

  const handleSend = async () => {
    if (!input.trim() || isInputDisabled) return

    // If limit was previously hit (e.g., resumed session), show modal
    if (dailyLimit) {
      setShowLimitModal(true)
      return
    }

    const content = input.trim()
    setInput('')

    // Create conversation on first send
    let activeConvoId = convoId
    if (!activeConvoId) {
      const result = await createConversation({ title: content.slice(0, 60), childId, childName })
      if (result.error || !result.data) {
        console.error('Failed to create conversation:', result.error)
        return
      }
      activeConvoId = result.data.id
      selfCreatedId.current = activeConvoId
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
    onMessageSent?.(activeConvoId, content.slice(0, 120))

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, conversationId: activeConvoId, childId, childName }),
      })

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({}))

        // Handle daily limit specially
        if (err.code === 'DAILY_LIMIT_REACHED') {
          // Calculate human-readable reset time
          const retryAfterSecs = parseInt(res.headers.get('Retry-After') ?? '0', 10)
          const resetDate = new Date(Date.now() + retryAfterSecs * 1000)
          const resetTimeText = resetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

          setDailyLimit({
            limit: err.limit ?? 5,
            planId: err.planId ?? 'free',
            resetTimeText,
          })
          setShowLimitModal(true)
          setIsTyping(false)
          return
        }

        throw new Error(err.error ?? `HTTP ${res.status}`)
      }

      // Start streaming
      const aiMsgId = `ai-${Date.now()}`
      setMessages(prev => [...prev, {
        id: aiMsgId,
        conversationId: activeConvoId!,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
      }])
      setIsTyping(false)
      setStreamingId(aiMsgId)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let accumulatedContent = ''
      let sources: Source[] = []
      let notFoundNote: string | undefined

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const jsonStr = line.slice(6).trim()
          if (!jsonStr) continue

          try {
            const event = JSON.parse(jsonStr)

            if (event.type === 'metadata') {
              sources = event.sources ?? []
            } else if (event.type === 'token') {
              accumulatedContent += event.content
              setMessages(prev =>
                prev.map(m => m.id === aiMsgId ? { ...m, content: accumulatedContent } : m)
              )
            } else if (event.type === 'done') {
              notFoundNote = event.notFoundNote
            } else if (event.type === 'error') {
              throw new Error(event.message)
            }
          } catch (parseErr) {
            if (parseErr instanceof SyntaxError) continue
            throw parseErr
          }
        }
      }

      setStreamingId(null)

      const finalContent = accumulatedContent.trim() ||
        "I wasn't able to generate a response. Please try again."

      const saved = await insertMessage({
        conversationId: activeConvoId!,
        role: 'assistant',
        content: finalContent,
        sources,
        notFoundNote,
      })

      setMessages(prev =>
        prev.map(m =>
          m.id === aiMsgId
            ? { ...m, id: saved.data?.id ?? aiMsgId, content: finalContent, sources, notFoundNote }
            : m
        )
      )

    } catch (err) {
      console.error('[chat]', err)
      setStreamingId(null)
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        conversationId: activeConvoId!,
        role: 'assistant',
        content: t.chat.error,
        createdAt: new Date().toISOString(),
      }])
    } finally {
      setIsTyping(false)
    }
  }

  const hasMessages = messages.length > 0

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      {/* Daily limit modal */}
      {showLimitModal && dailyLimit && (
        <DailyLimitModal
          limit={dailyLimit.limit}
          planId={dailyLimit.planId}
          resetTimeText={dailyLimit.resetTimeText}
          onClose={() => setShowLimitModal(false)}
        />
      )}

      {/* Chat header */}
      <div className="h-14 flex items-center justify-between px-5 border-b border-border flex-shrink-0 bg-canvas">
        <div className="flex items-center gap-3 min-w-0">
          {onShowConversations && (
            <button
              onClick={onShowConversations}
              className="md:hidden p-1.5 rounded-card text-ink-tertiary hover:text-ink hover:bg-raised focus-ring flex-shrink-0"
              style={{ transitionProperty: 'color, background-color', transitionDuration: '150ms' }}
              aria-label="Open conversations"
            >
              <PanelLeft size={18} strokeWidth={1.75} />
            </button>
          )}
          <div className="w-2 h-2 rounded-full bg-sage-400 flex-shrink-0" />
          <h2 className="font-display text-[1rem] font-semibold text-ink truncate">{conversationTitle}</h2>
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
              {t.chat.conversationAbout} <span className="font-semibold">{childName}</span>
            </span>
          </div>
          <Link
            href={`/children/${childId}`}
            className="flex items-center gap-1 text-body-xs text-dblue-600 hover:text-dblue-800 font-medium focus-ring rounded flex-shrink-0"
            style={{ transitionProperty: 'color', transitionDuration: '150ms' }}
          >
            {t.chat.viewProfile}
            <ArrowUpRight size={12} strokeWidth={2} />
          </Link>
        </div>
      )}

      {/* Messages or empty state */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-ink-tertiary animate-bounce-dot"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      ) : hasMessages ? (
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isStreaming={msg.id === streamingId}
              />
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
        disabled={isInputDisabled}
        limitReached={!!dailyLimit}
        onLimitClick={() => setShowLimitModal(true)}
      />
    </div>
  )
}
