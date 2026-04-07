import { Suspense } from 'react'
import { getConversations, getMessages } from '@/lib/actions/conversations'
import { ChatPageClient } from './ChatPageClient'

export default async function ChatPage({
  searchParams,
}: {
  searchParams: { childId?: string; childName?: string; conversationId?: string }
}) {
  const conversations = await getConversations()

  // If a specific conversation was requested, pre-load its messages
  const activeId = searchParams.conversationId ?? conversations[0]?.id ?? null
  const initialMessages = activeId ? await getMessages(activeId) : []

  return (
    <Suspense fallback={
      <div className="flex h-full items-center justify-center text-body-sm text-ink-tertiary">
        Loading…
      </div>
    }>
      <ChatPageClient
        initialConversations={conversations}
        initialActiveId={activeId}
        initialMessages={initialMessages}
        childId={searchParams.childId}
        childName={searchParams.childName}
      />
    </Suspense>
  )
}
