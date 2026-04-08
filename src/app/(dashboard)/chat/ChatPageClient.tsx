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
  // Profile selector
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

  const activeConvo = conversations.find(c => c.id === activeId)

  // Child context: prefer URL params (when navigating from a profile),
  // fall back to the child stored on the active conversation.
  const effectiveChildId   = urlChildId   ?? activeConvo?.childId
  const effectiveChildName = urlChildName ?? activeConvo?.childName

  // Show the profile selector when: no URL childId AND no conversation is actively open
  const showSelector = initialShowSelector && !activeId

  const handleSelect = async (id: string) => {
    if (id === activeId) return
    setActiveId(id)
    setIsLoadingMessages(true)
    const msgs = await getMessages(id)
    setMessages(msgs)
    setIsLoadingMessages(false)
  }

  const handleNewConversation = () => {
    setActiveId(null)
    setMessages([])
  }

  const handleConversationCreated = (conversation: Conversation) => {
    setConversations(prev => [conversation, ...prev])
    setActiveId(conversation.id)
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
      {showSelector ? (
        <ProfileSelector
          children={children}
          nounSingular={nounSingular}
          nounPlural={nounPlural}
          addLabel={addLabel}
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
