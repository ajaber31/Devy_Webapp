'use client'

import { useState } from 'react'
import { ConversationSidebar } from '@/components/chat/ConversationSidebar'
import { ChatArea } from '@/components/chat/ChatArea'
import { ProfileSelector } from '@/components/chat/ProfileSelector'
import { getMessages } from '@/lib/actions/conversations'
import type { Child, Conversation, Message } from '@/lib/types'

interface ChatPageClientProps {
  initialConversations: Conversation[]
  initialActiveId: string | null
  initialMessages: Message[]
  // URL params — set when navigating from a profile or conversation link
  childId?: string
  childName?: string
  // Profile selector shown initially (no conversations exist yet)
  showSelector: boolean
  children: Child[]
  nounSingular: string
  nounPlural: string
  addLabel: string
}

export function ChatPageClient({
  initialConversations,
  initialActiveId,
  initialMessages,
  childId: urlChildId,
  childName: urlChildName,
  showSelector: initialShowSelector,
  children,
  nounSingular,
  nounPlural,
  addLabel,
}: ChatPageClientProps) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
  const [activeId, setActiveId] = useState<string | null>(initialActiveId)
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)

  // Profile selector visibility — shown initially when no conversations,
  // or when the user explicitly clicks "New Conversation"
  const [selectorOpen, setSelectorOpen] = useState(initialShowSelector && !initialActiveId)

  // Child context for the active chat (may come from URL params, selector, or active conversation)
  const [chatChildId, setChatChildId] = useState<string | undefined>(urlChildId)
  const [chatChildName, setChatChildName] = useState<string | undefined>(urlChildName)

  const activeConvo = conversations.find(c => c.id === activeId)

  // Effective child: explicit URL/selector state > active conversation's stored child
  const effectiveChildId   = chatChildId   ?? activeConvo?.childId
  const effectiveChildName = chatChildName ?? activeConvo?.childName

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSelect = async (id: string) => {
    if (id === activeId) return
    setSelectorOpen(false)
    setChatChildId(undefined)
    setChatChildName(undefined)
    setActiveId(id)
    setIsLoadingMessages(true)
    const msgs = await getMessages(id)
    setMessages(msgs)
    setIsLoadingMessages(false)
  }

  // "+" button — show profile selector so user can pick context for new chat
  const handleNewConversation = () => {
    setActiveId(null)
    setMessages([])
    setChatChildId(undefined)
    setChatChildName(undefined)
    setSelectorOpen(true)
  }

  // User picked a child profile from the selector
  const handleProfileSelect = (child: Child) => {
    setSelectorOpen(false)
    setChatChildId(child.id)
    setChatChildName(child.name)
  }

  // User chose "General question" — no child profile attached
  const handleGeneralChat = () => {
    setSelectorOpen(false)
    setChatChildId(undefined)
    setChatChildName(undefined)
  }

  const handleConversationCreated = (conversation: Conversation) => {
    setConversations(prev => [conversation, ...prev])
    setActiveId(conversation.id)
    setSelectorOpen(false)
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Conversation sidebar */}
      <div className="hidden md:flex">
        <ConversationSidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={handleSelect}
          onNewConversation={handleNewConversation}
        />
      </div>

      {/* Main area: profile selector OR chat */}
      {selectorOpen ? (
        <ProfileSelector
          children={children}
          nounSingular={nounSingular}
          nounPlural={nounPlural}
          addLabel={addLabel}
          onSelectChild={handleProfileSelect}
          onGeneral={handleGeneralChat}
        />
      ) : (
        <ChatArea
          conversationId={activeId}
          conversationTitle={activeConvo?.title ?? 'New conversation'}
          initialMessages={isLoadingMessages ? [] : messages}
          childId={effectiveChildId}
          childName={effectiveChildName}
          onConversationCreated={handleConversationCreated}
        />
      )}
    </div>
  )
}
