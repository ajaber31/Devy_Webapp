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

  // Show selector only when no URL params AND no existing conversations
  const hasUrlContext = !!(searchParams.childId || searchParams.conversationId)
  const showSelector = !hasUrlContext && conversations.length === 0

  // Active conversation: explicit URL param > most recent existing > null (new)
  const activeId = searchParams.conversationId
    ?? ((!searchParams.childId && conversations.length > 0) ? conversations[0].id : null)

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
