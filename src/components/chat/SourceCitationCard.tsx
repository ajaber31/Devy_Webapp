'use client'

import { FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import type { Source } from '@/lib/types'

interface SourceCitationCardProps {
  source: Source
}

export function SourceCitationCard({ source }: SourceCitationCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-raised border border-border rounded-card overflow-hidden text-left">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-2.5 px-3 py-2.5 hover:bg-border/30 focus-ring"
        style={{ transitionProperty: 'background-color', transitionDuration: '150ms' }}
        aria-expanded={expanded}
        aria-label={`Source: ${source.documentName}`}
      >
        <div className="w-6 h-6 rounded bg-sage-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <FileText size={12} className="text-sage-600" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-body-xs font-semibold text-ink truncate">{source.title}</p>
          <p className="text-body-xs text-ink-tertiary">
            {source.documentName}
            {source.pageNumber && ` · Page ${source.pageNumber}`}
          </p>
        </div>
        <div className="text-ink-tertiary flex-shrink-0 mt-0.5">
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 pt-0 border-t border-border/50">
          <p className="text-body-xs text-ink-secondary leading-relaxed italic">
            &ldquo;{source.excerpt}&rdquo;
          </p>
        </div>
      )}
    </div>
  )
}
