'use client'

import Link from 'next/link'
import { MessageCircle, ArrowRight, Clock } from 'lucide-react'
import type { Child } from '@/lib/types'

const avatarBgMap: Record<string, string> = {
  sage: 'bg-sage-100 text-sage-700',
  dblue: 'bg-dblue-100 text-dblue-700',
  sand: 'bg-sand-100 text-sand-500',
}

const diagnosisBgMap: Record<string, string> = {
  sage: 'bg-sage-50 text-sage-700 border-sage-200',
  dblue: 'bg-dblue-50 text-dblue-700 border-dblue-200',
  sand: 'bg-sand-50 text-sand-600 border-sand-200',
}

interface ChildCardProps {
  child: Child
}

export function ChildCard({ child }: ChildCardProps) {
  const avatarClass = avatarBgMap[child.avatarColor] ?? avatarBgMap.sage
  const diagnosisClass = diagnosisBgMap[child.avatarColor] ?? diagnosisBgMap.sage
  const initial = child.name.charAt(0)
  const shownDiagnoses = child.diagnoses.slice(0, 2)
  const extraDiagnoses = child.diagnoses.length - 2

  return (
    <div
      className="bg-white rounded-card-lg shadow-card border border-border/50 overflow-hidden group"
      style={{ transitionProperty: 'box-shadow, transform', transitionDuration: '200ms', transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card-hover, 0 8px 24px rgba(44,42,39,0.10))'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = ''
        ;(e.currentTarget as HTMLElement).style.transform = ''
      }}
    >
      {/* Card top */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 font-display text-display-sm font-bold ${avatarClass}`}>
            {initial}
          </div>

          {/* Name + age */}
          <div className="min-w-0 flex-1 pt-1">
            <h3 className="font-display text-[1.05rem] font-semibold text-ink tracking-tight leading-tight">
              {child.name}
            </h3>
            <p className="text-body-xs text-ink-secondary mt-0.5">
              Age {child.age} &middot; {child.diagnoses[0]}
            </p>
          </div>
        </div>

        {/* Diagnosis badges */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {shownDiagnoses.map((d) => (
            <span key={d} className={`inline-block px-2.5 py-0.5 rounded-pill text-body-xs font-medium border ${diagnosisClass}`}>
              {d}
            </span>
          ))}
          {extraDiagnoses > 0 && (
            <span className="inline-block px-2.5 py-0.5 rounded-pill text-body-xs font-medium bg-raised text-ink-secondary">
              +{extraDiagnoses}
            </span>
          )}
        </div>

        {/* Support needs preview */}
        {child.supportNeeds.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <p className="text-body-xs text-ink-tertiary uppercase tracking-wider font-semibold mb-1.5">Support needs</p>
            <ul className="space-y-1">
              {child.supportNeeds.slice(0, 2).map((need) => (
                <li key={need} className="flex items-start gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-ink-tertiary mt-1.5 flex-shrink-0" />
                  <span className="text-body-xs text-ink-secondary leading-snug">{need}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Action row */}
      <div className="px-4 py-3 bg-surface border-t border-border/50 flex items-center gap-2">
        <Link
          href={`/children/${child.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-card text-body-xs font-semibold text-ink-secondary hover:text-ink hover:bg-raised border border-transparent hover:border-border focus-ring"
          style={{ transitionProperty: 'color, background-color, border-color', transitionDuration: '150ms' }}
        >
          View Profile
          <ArrowRight size={12} strokeWidth={2} />
        </Link>
        <Link
          href={`/chat?childId=${child.id}&childName=${encodeURIComponent(child.name)}`}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-card text-body-xs font-semibold bg-sage-500 text-white hover:bg-sage-600 active:scale-[0.98] shadow-button focus-ring"
          style={{ transitionProperty: 'background-color, transform', transitionDuration: '150ms' }}
        >
          <MessageCircle size={12} strokeWidth={2} />
          Ask Devy
        </Link>
        <Link
          href={`/chat?childId=${child.id}&childName=${encodeURIComponent(child.name)}`}
          className="p-2 rounded-card text-ink-tertiary hover:text-ink hover:bg-raised border border-transparent hover:border-border focus-ring"
          style={{ transitionProperty: 'color, background-color, border-color', transitionDuration: '150ms' }}
          title="View conversations"
        >
          <Clock size={14} strokeWidth={1.75} />
        </Link>
      </div>
    </div>
  )
}
