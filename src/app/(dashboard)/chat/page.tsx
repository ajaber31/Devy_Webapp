import { Suspense } from 'react'
import { getConversations, getMessages } from '@/lib/actions/conversations'
import { getChildren } from '@/lib/actions/children'
import { getProfile } from '@/lib/actions/profile'
import { getRoleTerminology } from '@/lib/role-terminology'
import { ChatPageClient } from './ChatPageClient'

export default async function ChatPage({
  searchParams,
}: {
  searchParams: { childId?: string; childName?: string; conversationId?: string }
}) {
  const [conversations, children, profile] = await Promise.all([
    getConversations(),
    getChildren(),
    getProfile(),
  ])

  const terms = getRoleTerminology(profile?.role ?? 'parent')

  // Show selector when neither a profile nor a specific conversation was requested
  const showSelector = !searchParams.childId && !searchParams.conversationId

  // Only pre-load messages when a specific conversation is requested
  const activeId = showSelector ? null : (searchParams.conversationId ?? null)
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
        showSelector={showSelector}
        children={children}
        nounSingular={terms.nounSingular}
        nounPlural={terms.nounPlural}
        addLabel={terms.addLabel}
      />
    </Suspense>
  )
}
