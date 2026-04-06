'use client'

import { useState } from 'react'
import { ConversationSidebar } from '@/components/chat/ConversationSidebar'
import { ChatArea } from '@/components/chat/ChatArea'
import { mockConversations } from '@/lib/mock-data/conversations'

export default function ChatPage() {
  const [activeId, setActiveId] = useState('c1')
  const activeConvo = mockConversations.find(c => c.id === activeId)

  return (
    <div className="flex h-full overflow-hidden">
      {/* Conversation sidebar — hidden on small screens */}
      <div className="hidden md:flex">
        <ConversationSidebar activeId={activeId} onSelect={setActiveId} />
      </div>

      {/* Chat area */}
      <ChatArea
        conversationId={activeId}
        conversationTitle={activeConvo?.title ?? 'New conversation'}
      />
    </div>
  )
}
