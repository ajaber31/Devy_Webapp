'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ConversationSidebar } from '@/components/chat/ConversationSidebar'
import { ChatArea } from '@/components/chat/ChatArea'
import { mockConversations } from '@/lib/mock-data/conversations'

function ChatPageInner() {
  const searchParams = useSearchParams()
  const childId = searchParams.get('childId') ?? undefined
  const childName = searchParams.get('childName') ?? undefined

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
        childId={childId}
        childName={childName}
      />
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center text-body-sm text-ink-tertiary">Loading…</div>}>
      <ChatPageInner />
    </Suspense>
  )
}
