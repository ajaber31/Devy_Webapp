'use client'

import { useEffect, useState } from 'react'
import { X, Plus } from 'lucide-react'
import { ConversationSidebar } from './ConversationSidebar'
import type { Conversation } from '@/lib/types'

interface MobileConversationsDrawerProps {
  open: boolean
  onClose: () => void
  conversations: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
  onNewConversation: () => void
  onRename?: (id: string, title: string) => void
  onPin?: (id: string, isPinned: boolean) => void
  onDelete?: (id: string) => void
}

export function MobileConversationsDrawer({
  open,
  onClose,
  conversations,
  activeId,
  onSelect,
  onNewConversation,
  onRename,
  onPin,
  onDelete,
}: MobileConversationsDrawerProps) {
  // Two-frame trick: mount closed, then animate open
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open) {
      const raf = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(raf)
    } else {
      setVisible(false)
    }
  }, [open])

  if (!open) return null

  const handleSelect = (id: string) => {
    onSelect(id)
    onClose()
  }

  const handleNewConversation = () => {
    onNewConversation()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 200ms ease' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel — slides in from left */}
      <div
        className="relative z-10 flex flex-col h-full bg-surface shadow-floating"
        style={{
          width: '18rem',
          transform: visible ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 220ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0 bg-surface">
          <h2 className="font-display text-[1.05rem] font-semibold text-ink">Conversations</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={handleNewConversation}
              className="w-7 h-7 rounded-full bg-sage-500 text-white flex items-center justify-center hover:bg-sage-600 active:scale-95 focus-ring"
              style={{ transitionProperty: 'background-color, transform', transitionDuration: '150ms' }}
              aria-label="New conversation"
            >
              <Plus size={14} strokeWidth={2.5} />
            </button>
            <button
              onClick={onClose}
              className="ml-1 p-1.5 rounded-md text-ink-tertiary hover:text-ink hover:bg-raised focus-ring"
              style={{ transitionProperty: 'color, background-color', transitionDuration: '150ms' }}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Conversation list — reuse sidebar with header hidden */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <ConversationSidebar
            conversations={conversations}
            activeId={activeId}
            onSelect={handleSelect}
            onNewConversation={handleNewConversation}
            onRename={onRename}
            onPin={onPin}
            onDelete={onDelete}
            hideHeader
            className="border-r-0 w-full"
          />
        </div>
      </div>
    </div>
  )
}
