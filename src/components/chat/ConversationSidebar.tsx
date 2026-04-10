'use client'

import { useState, useRef } from 'react'
import { Search, Plus, Pin, MessageCircle, User, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { formatDate, truncate, cn } from '@/lib/utils'
import type { Conversation } from '@/lib/types'

interface ConversationSidebarProps {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
  onNewConversation: () => void
  onRename?: (id: string, title: string) => void
  onDelete?: (id: string) => void
}

export function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onNewConversation,
  onRename,
  onDelete,
}: ConversationSidebarProps) {
  const [query, setQuery] = useState('')

  const filtered = conversations.filter(c =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.preview.toLowerCase().includes(query.toLowerCase())
  )

  const pinned  = filtered.filter(c => c.isPinned)
  const recents = filtered.filter(c => !c.isPinned)

  return (
    <aside className="w-72 flex-shrink-0 flex flex-col border-r border-border bg-surface h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between flex-shrink-0">
        <h2 className="font-display text-[1.05rem] font-semibold text-ink">Conversations</h2>
        <button
          onClick={onNewConversation}
          className="w-7 h-7 rounded-full bg-sage-500 text-white flex items-center justify-center hover:bg-sage-600 active:scale-95 focus-ring"
          style={{ transitionProperty: 'background-color, transform', transitionDuration: '150ms' }}
          aria-label="New conversation"
        >
          <Plus size={14} strokeWidth={2.5} />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pb-3 flex-shrink-0">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search…"
            className="w-full pl-8 pr-3 py-1.5 bg-raised border border-border rounded-pill text-body-xs placeholder:text-ink-tertiary focus:outline-none focus:border-sage-400 focus:shadow-input-focus"
            style={{ transitionProperty: 'border-color, box-shadow', transitionDuration: '150ms' }}
          />
        </div>
      </div>

      {/* Lists */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {pinned.length > 0 && (
          <>
            <p className="px-2 pt-1 pb-1.5 text-body-xs font-semibold text-ink-tertiary uppercase tracking-wider flex items-center gap-1">
              <Pin size={10} strokeWidth={2.5} /> Pinned
            </p>
            {pinned.map(c => (
              <ConvoItem
                key={c.id}
                convo={c}
                active={activeId === c.id}
                onSelect={onSelect}
                onRename={onRename}
                onDelete={onDelete}
              />
            ))}
            <div className="my-2 border-b border-border/50" />
          </>
        )}

        {recents.length > 0 && (
          <>
            <p className="px-2 pt-1 pb-1.5 text-body-xs font-semibold text-ink-tertiary uppercase tracking-wider">Recent</p>
            {recents.map(c => (
              <ConvoItem
                key={c.id}
                convo={c}
                active={activeId === c.id}
                onSelect={onSelect}
                onRename={onRename}
                onDelete={onDelete}
              />
            ))}
          </>
        )}

        {filtered.length === 0 && conversations.length === 0 && (
          <div className="text-center py-8 px-3">
            <p className="text-body-xs text-ink-tertiary mb-3">No conversations yet.</p>
            <button
              onClick={onNewConversation}
              className="text-body-xs text-sage-600 hover:text-sage-700 font-medium"
              style={{ transitionProperty: 'color', transitionDuration: '150ms' }}
            >
              Select a profile to start →
            </button>
          </div>
        )}

        {filtered.length === 0 && conversations.length > 0 && (
          <p className="text-center text-body-xs text-ink-tertiary py-8">No conversations match your search.</p>
        )}
      </div>
    </aside>
  )
}

function ConvoItem({
  convo,
  active,
  onSelect,
  onRename,
  onDelete,
}: {
  convo: Conversation
  active: boolean
  onSelect: (id: string) => void
  onRename?: (id: string, title: string) => void
  onDelete?: (id: string) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(convo.title)
  const inputRef = useRef<HTMLInputElement>(null)

  const startRename = () => {
    setMenuOpen(false)
    setRenameValue(convo.title)
    setRenaming(true)
    // focus on next paint
    setTimeout(() => inputRef.current?.select(), 0)
  }

  const commitRename = () => {
    const trimmed = renameValue.trim()
    if (trimmed && trimmed !== convo.title) {
      onRename?.(convo.id, trimmed)
    }
    setRenaming(false)
  }

  const handleRenameKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); commitRename() }
    if (e.key === 'Escape') { setRenaming(false) }
  }

  return (
    <div className="relative group/row mb-0.5">
      {renaming ? (
        /* Inline rename input */
        <div className={cn('flex items-center gap-2 px-2.5 py-2 rounded-card', active ? 'bg-sage-100' : 'bg-raised')}>
          <div className={cn('w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0', active ? 'bg-sage-200 text-sage-700' : 'bg-raised text-ink-tertiary')}>
            <MessageCircle size={12} strokeWidth={2} />
          </div>
          <input
            ref={inputRef}
            value={renameValue}
            onChange={e => setRenameValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={handleRenameKey}
            autoFocus
            className="flex-1 min-w-0 text-body-xs font-medium text-ink bg-transparent border-b border-sage-400 outline-none"
          />
        </div>
      ) : (
        <button
          onClick={() => onSelect(convo.id)}
          className={cn(
            'w-full flex items-start gap-2.5 px-2.5 py-2.5 rounded-card text-left',
            active ? 'bg-sage-100 shadow-card' : 'hover:bg-raised'
          )}
          style={{ transitionProperty: 'background-color', transitionDuration: '150ms' }}
        >
          <div className={cn(
            'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
            active ? 'bg-sage-200 text-sage-700' : 'bg-raised text-ink-tertiary'
          )}>
            <MessageCircle size={12} strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn('text-body-xs font-medium truncate', active ? 'text-sage-800' : 'text-ink')}>
              {convo.title}
            </p>
            {convo.childName && (
              <p className="flex items-center gap-1 text-[0.65rem] text-dblue-600 font-medium mt-0.5">
                <User size={9} strokeWidth={2.5} />
                {convo.childName}
              </p>
            )}
            <p className="text-body-xs text-ink-tertiary truncate mt-0.5">
              {truncate(convo.preview || 'No messages yet', 45)}
            </p>
            <p className="text-[0.65rem] text-ink-tertiary mt-0.5">{formatDate(convo.updatedAt)}</p>
          </div>
        </button>
      )}

      {/* Action button — visible on row hover */}
      {!renaming && (
        <button
          onClick={e => { e.stopPropagation(); setMenuOpen(v => !v) }}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded text-ink-tertiary hover:text-ink hover:bg-border/60 focus-ring opacity-0 group-hover/row:opacity-100"
          style={{ transitionProperty: 'opacity, color, background-color', transitionDuration: '150ms' }}
          aria-label="Conversation actions"
        >
          <MoreHorizontal size={13} strokeWidth={2} />
        </button>
      )}

      {/* Dropdown */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-full mt-0.5 bg-white rounded-card shadow-floating border border-border py-1 z-20 min-w-[130px]">
            <button
              onClick={startRename}
              className="w-full flex items-center gap-2 px-3 py-2 text-body-sm text-ink-secondary hover:bg-raised hover:text-ink"
              style={{ transitionProperty: 'background-color, color', transitionDuration: '150ms' }}
            >
              <Pencil size={13} />
              Rename
            </button>
            <button
              onClick={() => { setMenuOpen(false); onDelete?.(convo.id) }}
              className="w-full flex items-center gap-2 px-3 py-2 text-body-sm text-danger hover:bg-raised"
              style={{ transitionProperty: 'background-color', transitionDuration: '150ms' }}
            >
              <Trash2 size={13} />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  )
}
