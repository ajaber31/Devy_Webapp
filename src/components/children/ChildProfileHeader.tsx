'use client'

import Link from 'next/link'
import { MessageCircle, ArrowRight, Trash2 } from 'lucide-react'
import { ageFromDob } from '@/lib/utils'
import { useLanguage } from '@/components/shared/LanguageProvider'
import type { Child } from '@/lib/types'

const avatarBgMap: Record<string, string> = {
  sage: 'bg-sage-100 text-sage-700',
  dblue: 'bg-dblue-100 text-dblue-700',
  sand: 'bg-sand-100 text-sand-500',
}

const labelBgMap: Record<string, string> = {
  sage: 'bg-sage-50 text-sage-700 border-sage-200',
  dblue: 'bg-dblue-50 text-dblue-700 border-dblue-200',
  sand: 'bg-sand-50 text-sand-600 border-sand-200',
}

interface ChildProfileHeaderProps {
  child: Child
  onEdit?: () => void
  onDelete?: () => void
}

export function ChildProfileHeader({ child, onEdit, onDelete }: ChildProfileHeaderProps) {
  const { t } = useLanguage()
  const tc = t.children
  const avatarClass = avatarBgMap[child.avatarColor] ?? avatarBgMap.sage
  const labelClass = labelBgMap[child.avatarColor] ?? labelBgMap.sage
  const initial = child.name.charAt(0)
  const age = ageFromDob(child.dateOfBirth)

  return (
    <div className="bg-white rounded-card-lg shadow-card border border-border/50 px-7 py-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-5">
          {/* Large avatar */}
          <div className={`w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0 font-display text-display-lg font-bold shadow-card ${avatarClass}`}>
            {initial}
          </div>

          {/* Info */}
          <div>
            <h1 className="font-display text-display-md font-bold text-ink tracking-tight leading-tight">
              {child.name}
            </h1>
            <p className="text-body-sm text-ink-secondary mt-1">
              {age !== null ? `${tc.ageLabel} ${age}` : tc.ageNotSet}
              {child.dateOfBirth ? ` · ${tc.bornLabel} ${new Date(child.dateOfBirth).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })}` : ''}
            </p>

            {/* Context label badges */}
            {child.contextLabels.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {child.contextLabels.map((label) => (
                  <span key={label} className={`inline-block px-2.5 py-0.5 rounded-pill text-body-xs font-medium border ${labelClass}`}>
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-2 rounded-card text-ink-tertiary hover:text-danger hover:bg-danger/5 border border-transparent hover:border-danger/20 focus-ring"
              style={{ transitionProperty: 'color, background-color, border-color', transitionDuration: '150ms' }}
              aria-label={tc.deleteProfile}
              title={tc.deleteProfile}
            >
              <Trash2 size={15} strokeWidth={1.75} />
            </button>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 px-4 py-2 rounded-card text-body-sm font-medium text-ink-secondary hover:text-ink hover:bg-raised border border-border focus-ring"
              style={{ transitionProperty: 'color, background-color', transitionDuration: '150ms' }}
            >
              {tc.editProfile}
            </button>
          )}
          <Link
            href={`/chat?childId=${child.id}&childName=${encodeURIComponent(child.name)}`}
            className="flex items-center gap-2 px-5 py-2.5 bg-sage-500 text-white font-semibold text-body-sm rounded-card shadow-button hover:bg-sage-600 active:scale-[0.98] focus-ring"
            style={{ transitionProperty: 'background-color, transform', transitionDuration: '150ms' }}
          >
            <MessageCircle size={15} strokeWidth={2} />
            {tc.askDevyAbout} {child.name.split(' ')[0]}
            <ArrowRight size={13} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </div>
  )
}
