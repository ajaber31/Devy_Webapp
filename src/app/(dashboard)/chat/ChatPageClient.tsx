'use client'

import { useState } from 'react'
import { ConversationSidebar } from '@/components/chat/ConversationSidebar'
import { ChatArea } from '@/components/chat/ChatArea'
import { getMessages } from '@/lib/actions/conversations'
import type { Conversation, Message } from '@/lib/types'

interface ChatPageClientProps {
  initialConversations: Conversation[]
  initialActiveId: string | null
  initialMessages: Message[]
  childId?: string
  childName?: string
}

export function ChatPageClient({
  initialConversations,
  initialActiveId,
  initialMessages,
  childId,
  childName,
}: ChatPageClientProps) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
  const [activeId, setActiveId] = useState<string | null>(initialActiveId)
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)

  const activeConvo = conversations.find(c => c.id === activeId)

  const handleSelect = async (id: string) => {
    if (id === activeId) return
    setActiveId(id)
    setIsLoadingMessages(true)
    const msgs = await getMessages(id)
    setMessages(msgs)
    setIsLoadingMessages(false)
  }

  const handleNewConversation = () => {
    // Clear active state — ChatArea will create conversation on first send
    setActiveId(null)
    setMessages([])
  }

  const handleConversationCreated = (conversation: Conversation) => {
    setConversations(prev => [conversation, ...prev])
    setActiveId(conversation.id)
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Conversation sidebar — hidden on small screens */}
      <div className="hidden md:flex">
        <ConversationSidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={handleSelect}
          onNewConversation={handleNewConversation}
        />
      </div>

      {/* Chat area */}
      <ChatArea
        conversationId={activeId}
        conversationTitle={activeConvo?.title ?? 'New conversation'}
        initialMessages={isLoadingMessages ? [] : messages}
        childId={childId}
        childName={childName}
        onConversationCreated={handleConversationCreated}
      />
    </div>
  )
}
