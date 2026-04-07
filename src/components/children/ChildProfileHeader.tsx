import Link from 'next/link'
import { MessageCircle, ArrowRight, Edit2 } from 'lucide-react'
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

interface ChildProfileHeaderProps {
  child: Child
}

export function ChildProfileHeader({ child }: ChildProfileHeaderProps) {
  const avatarClass = avatarBgMap[child.avatarColor] ?? avatarBgMap.sage
  const diagnosisClass = diagnosisBgMap[child.avatarColor] ?? diagnosisBgMap.sage
  const initial = child.name.charAt(0)

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
              Age {child.age} &middot; Born {new Date(child.dateOfBirth).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>

            {/* Diagnosis badges */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {child.diagnoses.map((d) => (
                <span key={d} className={`inline-block px-2.5 py-0.5 rounded-pill text-body-xs font-medium border ${diagnosisClass}`}>
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            className="flex items-center gap-1.5 px-4 py-2 rounded-card text-body-sm font-medium text-ink-secondary hover:text-ink hover:bg-raised border border-border focus-ring"
            style={{ transitionProperty: 'color, background-color', transitionDuration: '150ms' }}
          >
            <Edit2 size={14} strokeWidth={1.75} />
            Edit profile
          </button>
          <Link
            href={`/chat?childId=${child.id}&childName=${encodeURIComponent(child.name)}`}
            className="flex items-center gap-2 px-5 py-2.5 bg-sage-500 text-white font-semibold text-body-sm rounded-card shadow-button hover:bg-sage-600 active:scale-[0.98] focus-ring"
            style={{ transitionProperty: 'background-color, transform', transitionDuration: '150ms' }}
          >
            <MessageCircle size={15} strokeWidth={2} />
            Ask Devy about {child.name.split(' ')[0]}
            <ArrowRight size={13} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </div>
  )
}
