import Link from 'next/link'
import { MessageCircle, Pin, ArrowRight, Clock } from 'lucide-react'
import { formatDate, truncate } from '@/lib/utils'
import type { Conversation } from '@/lib/types'

interface RecentConversationsProps {
  conversations: Conversation[]
}

export function RecentConversations({ conversations }: RecentConversationsProps) {
  if (conversations.length === 0) {
    return (
      <div className="bg-white rounded-card-lg shadow-card border border-border/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle size={16} className="text-sage-500" strokeWidth={2} />
            <h3 className="font-display text-[1.05rem] font-semibold text-ink">Recent conversations</h3>
          </div>
          <Link href="/chat" className="text-body-xs text-sage-600 hover:text-sage-700 font-medium flex items-center gap-1"
            style={{ transitionProperty: 'color', transitionDuration: '150ms' }}>
            Start one <ArrowRight size={12} strokeWidth={2.5} />
          </Link>
        </div>
        <div className="px-5 py-10 text-center">
          <p className="text-body-sm text-ink-tertiary">No conversations yet. Start a new chat to get going.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-card-lg shadow-card border border-border/50 overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle size={16} className="text-sage-500" strokeWidth={2} />
          <h3 className="font-display text-[1.05rem] font-semibold text-ink">Recent conversations</h3>
        </div>
        <Link href="/chat" className="text-body-xs text-sage-600 hover:text-sage-700 font-medium flex items-center gap-1"
          style={{ transitionProperty: 'color', transitionDuration: '150ms' }}>
          View all <ArrowRight size={12} strokeWidth={2.5} />
        </Link>
      </div>

      <ul>
        {conversations.map((convo, i) => (
          <li key={convo.id}>
            <Link
              href={`/chat?conversationId=${convo.id}`}
              className="flex items-start gap-3 px-5 py-3.5 hover:bg-surface group"
              style={{ transitionProperty: 'background-color', transitionDuration: '150ms' }}
            >
              <div className="w-8 h-8 rounded-full bg-sage-100 text-sage-600 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-sage-200"
                style={{ transitionProperty: 'background-color', transitionDuration: '150ms' }}>
                {convo.isPinned
                  ? <Pin size={14} strokeWidth={2} />
                  : <MessageCircle size={14} strokeWidth={2} />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-body-sm font-medium text-ink truncate">{convo.title}</p>
                  {convo.isPinned && (
                    <span className="flex-shrink-0 px-1.5 py-0.5 bg-sage-100 text-sage-700 rounded text-[0.65rem] font-medium">Pinned</span>
                  )}
                </div>
                <p className="text-body-xs text-ink-tertiary truncate">{truncate(convo.preview || 'No messages yet', 70)}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-body-xs text-ink-tertiary">
                    <Clock size={10} strokeWidth={2} />
                    {formatDate(convo.updatedAt)}
                  </span>
                  <span className="text-body-xs text-ink-tertiary">{convo.messageCount} messages</span>
                  <div className="flex gap-1">
                    {convo.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="px-1.5 py-0.5 bg-raised rounded text-[0.65rem] text-ink-secondary">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
            {i < conversations.length - 1 && <div className="mx-5 border-b border-border/50" />}
          </li>
        ))}
      </ul>
    </div>
  )
}
