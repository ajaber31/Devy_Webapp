'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MessageCircle, Plus, Users } from 'lucide-react'
import { ageFromDob } from '@/lib/utils'
import type { Child } from '@/lib/types'

interface ProfileSelectorProps {
  children: Child[]
  nounSingular: string
  nounPlural: string
  addLabel: string
}

const avatarBgMap: Record<string, string> = {
  sage:  'bg-sage-100 text-sage-700',
  dblue: 'bg-dblue-100 text-dblue-700',
  sand:  'bg-sand-100 text-sand-500',
}

export function ProfileSelector({
  children,
  nounSingular,
  nounPlural,
  addLabel,
}: ProfileSelectorProps) {
  const router = useRouter()

  const startChat = (child: Child) => {
    router.push(`/chat?childId=${child.id}&childName=${encodeURIComponent(child.name)}`)
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
      <div className="w-full max-w-xl">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-sage-100 flex items-center justify-center mx-auto mb-4">
            <Users size={22} className="text-sage-600" strokeWidth={1.75} />
          </div>
          <h2 className="font-display text-display-sm font-semibold text-ink tracking-tight mb-2">
            Who are we supporting today?
          </h2>
          <p className="text-body-sm text-ink-secondary max-w-sm mx-auto leading-relaxed">
            Select a {nounSingular.toLowerCase()} profile to keep conversations
            organised and grounded in their context.
          </p>
        </div>

        {/* Profile list */}
        {children.length > 0 ? (
          <div className="space-y-2">
            {children.map(child => {
              const avatarClass = avatarBgMap[child.avatarColor] ?? avatarBgMap.sage
              const age = ageFromDob(child.dateOfBirth)
              const shownLabels = child.contextLabels.slice(0, 3)

              return (
                <button
                  key={child.id}
                  onClick={() => startChat(child)}
                  className="w-full flex items-center gap-4 px-4 py-3.5 bg-white border border-border rounded-card-lg shadow-card hover:shadow-card-hover hover:border-sage-300 hover:bg-sage-50/30 active:scale-[0.995] text-left focus-ring group"
                  style={{ transitionProperty: 'border-color, background-color, box-shadow, transform', transitionDuration: '150ms' }}
                >
                  {/* Avatar */}
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 font-display text-[1rem] font-bold ${avatarClass}`}>
                    {child.name.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink text-body-sm group-hover:text-sage-800 leading-tight"
                      style={{ transitionProperty: 'color', transitionDuration: '150ms' }}>
                      {child.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {age !== null && (
                        <span className="text-body-xs text-ink-tertiary">Age {age}</span>
                      )}
                      {shownLabels.map(label => (
                        <span key={label} className="inline-block px-2 py-0.5 rounded-pill text-[0.65rem] font-medium bg-raised text-ink-secondary border border-border/60">
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 rounded-card bg-sage-50 text-sage-700 group-hover:bg-sage-500 group-hover:text-white border border-sage-200 group-hover:border-sage-500"
                    style={{ transitionProperty: 'background-color, color, border-color', transitionDuration: '150ms' }}>
                    <MessageCircle size={13} strokeWidth={2} />
                    <span className="text-body-xs font-semibold">Chat</span>
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          /* Empty state */
          <div className="text-center py-10 px-6 bg-surface rounded-card-lg border border-border">
            <p className="text-body-sm text-ink-secondary mb-4 leading-relaxed">
              No {nounPlural.toLowerCase()} added yet.
              <br />Add a profile first to start a conversation.
            </p>
            <Link
              href="/children"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-sage-500 text-white text-body-sm font-semibold rounded-card shadow-button hover:bg-sage-600 active:scale-[0.98] focus-ring"
              style={{ transitionProperty: 'background-color, transform', transitionDuration: '150ms' }}
            >
              <Plus size={14} strokeWidth={2.5} />
              {addLabel}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
