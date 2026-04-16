'use client'

import { FlaskConical, BookOpen } from 'lucide-react'
import { useLanguage } from '@/components/shared/LanguageProvider'

interface ResearchBadgeProps {
  hasPubMed: boolean
}

export function ResearchBadge({ hasPubMed }: ResearchBadgeProps) {
  const { t } = useLanguage()
  const tc = t.chatUi

  if (hasPubMed) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-dblue-200 bg-dblue-50 rounded-pill text-body-xs font-medium text-dblue-600 mt-2 select-none">
        <FlaskConical size={11} strokeWidth={2.5} className="shrink-0" />
        {tc.pubmedBadge}
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-sage-200 bg-sage-50 rounded-pill text-body-xs font-medium text-sage-700 mt-2 select-none">
      <BookOpen size={11} strokeWidth={2.5} className="shrink-0" />
      {tc.kbBadge}
    </div>
  )
}
