import { Suspense } from 'react'
import { getConversations, getMessages } from '@/lib/actions/conversations'
import { getChildren, getChild } from '@/lib/actions/children'
import { getProfile } from '@/lib/actions/profile'
import { getRoleTerminology } from '@/lib/role-terminology'
import { getLang } from '@/lib/i18n/server'
import { ChatPageClient } from './ChatPageClient'

export default async function ChatPage({
  searchParams,
}: {
  searchParams: { childId?: string; childName?: string; conversationId?: string }
}) {
  const [conversations, children, profile, lang] = await Promise.all([
    getConversations(),
    getChildren(),
    getProfile(),
    getLang(),
  ])

  const terms = getRoleTerminology(profile?.role ?? 'parent', lang)

  // Show selector only when no URL params AND no existing conversations
  const hasUrlContext = !!(searchParams.childId || searchParams.conversationId)
  const showSelector = !hasUrlContext && conversations.length === 0

  // Active conversation: explicit URL param > most recent existing > null (new)
  const activeId = searchParams.conversationId
    ?? ((!searchParams.childId && conversations.length > 0) ? conversations[0].id : null)

  const initialMessages = activeId ? await getMessages(activeId) : []

  // Resolve child context: URL param > active conversation data > DB lookup fallback.
  // This ensures the banner and sidebar tag appear correctly when navigating back
  // to /chat without URL params (e.g. from dashboard → chat).
  const activeConvo = activeId ? conversations.find(c => c.id === activeId) : undefined
  const resolvedChildId   = searchParams.childId   ?? activeConvo?.childId
  let resolvedChildName = searchParams.childName  ?? activeConvo?.childName

  // Fallback: if we have a childId but still no name (JOIN didn't return it),
  // do a targeted DB lookup so the banner always shows the right name.
  if (resolvedChildId && !resolvedChildName) {
    const child = await getChild(resolvedChildId)
    resolvedChildName = child?.name ?? undefined
  }

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
        childId={resolvedChildId}
        childName={resolvedChildName}
        showSelector={showSelector}
        profiles={children}
        nounSingular={terms.nounSingular}
        nounPlural={terms.nounPlural}
        addLabel={terms.addLabel}
      />
    </Suspense>
  )
}
