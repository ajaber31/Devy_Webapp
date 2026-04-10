'use client'

import { useState } from 'react'
import { ConversationSidebar } from '@/components/chat/ConversationSidebar'
import { ChatArea } from '@/components/chat/ChatArea'
import { ProfileSelector } from '@/components/chat/ProfileSelector'
import { MobileConversationsDrawer } from '@/components/chat/MobileConversationsDrawer'
import { getMessages, renameConversation, deleteConversation, pinConversation } from '@/lib/actions/conversations'
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
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

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
    setIsLoadingMessages(true)
    // Fetch BEFORE changing activeId so all three state updates batch together,
    // ensuring ChatArea receives the correct initialMessages on its first render.
    const msgs = await getMessages(id)
    setMessages(msgs)
    setActiveId(id)
    setIsLoadingMessages(false)
  }

  const handleMessageSent = (conversationId: string, preview: string) => {
    setConversations(prev =>
      prev
        .map(c => c.id === conversationId
          ? { ...c, preview, updatedAt: new Date().toISOString() }
          : c
        )
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    )
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

  const handleRename = (id: string, title: string) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, title } : c))
    renameConversation(id, title).catch(console.error)
  }

  const handlePin = (id: string, isPinned: boolean) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, isPinned } : c))
    pinConversation(id, isPinned).catch(console.error)
  }

  const handleDelete = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id))
    if (activeId === id) {
      setActiveId(null)
      setMessages([])
    }
    deleteConversation(id).catch(console.error)
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Desktop conversation sidebar */}
      <div className="hidden md:flex">
        <ConversationSidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={handleSelect}
          onNewConversation={handleNewConversation}
          onRename={handleRename}
          onPin={handlePin}
          onDelete={handleDelete}
        />
      </div>

      {/* Mobile conversations drawer (slide-over from left) */}
      <MobileConversationsDrawer
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        conversations={conversations}
        activeId={activeId}
        onSelect={handleSelect}
        onNewConversation={handleNewConversation}
        onRename={handleRename}
        onPin={handlePin}
        onDelete={handleDelete}
      />

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
          initialMessages={messages}
          isLoading={isLoadingMessages}
          childId={effectiveChildId}
          childName={effectiveChildName}
          onConversationCreated={handleConversationCreated}
          onMessageSent={handleMessageSent}
          onShowConversations={() => setMobileDrawerOpen(true)}
        />
      )}
    </div>
  )
}
