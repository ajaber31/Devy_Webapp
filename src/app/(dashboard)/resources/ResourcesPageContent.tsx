'use client'

import { useState } from 'react'
import { MessageSquare, FileText, FileType2, BookOpen } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { cn } from '@/lib/utils'
import type { Document } from '@/lib/types'

interface ResourcesPageContentProps {
  documents: Document[]
}

const TAG_COLOR_MAP: Record<string, string> = {
  'peer-reviewed': 'bg-dblue-100 text-dblue-700',
  'pubmed-auto':   'bg-dblue-50 text-dblue-600',
  'behavior':      'bg-sand-100 text-sand-600',
  'sensory':       'bg-sage-100 text-sage-700',
  'communication': 'bg-sage-100 text-sage-600',
  'iep':           'bg-raised text-ink-secondary',
}

const FILE_ICON_MAP: Record<string, React.ReactNode> = {
  pdf:  <FileText size={15} strokeWidth={1.75} className="text-ink-tertiary" />,
  docx: <FileType2 size={15} strokeWidth={1.75} className="text-ink-tertiary" />,
  txt:  <BookOpen size={15} strokeWidth={1.75} className="text-ink-tertiary" />,
}

function getDisplayTag(doc: Document): string {
  const priority = ['peer-reviewed', 'sensory', 'behavior', 'communication', 'iep', 'pubmed-auto']
  return priority.find(t => doc.tags.includes(t)) ?? doc.tags.find(t => !t.startsWith('pmid:')) ?? 'General'
}

export function ResourcesPageContent({ documents }: ResourcesPageContentProps) {
  // Build category list from real tags (excluding pmid:xxxxx and pubmed-auto)
  const rawTags = Array.from(
    new Set(documents.flatMap(d => d.tags.filter(t => !t.startsWith('pmid:') && t !== 'pubmed-auto')))
  ).sort()

  const categories = rawTags.length > 0 ? ['All', ...rawTags] : ['All']
  const showFilter = categories.length > 1

  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = activeCategory === 'All'
    ? documents
    : documents.filter(d => d.tags.includes(activeCategory))

  if (documents.length === 0) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <PageHeader
          title="Resources"
          description="Clinician-curated materials drawn from Devy's knowledge base."
        />
        <div className="text-center py-24">
          <BookOpen size={32} className="text-ink-tertiary mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-body-sm font-medium text-ink-secondary">No resources available yet.</p>
          <p className="text-body-xs text-ink-tertiary mt-1">
            Resources are added by the Devy clinical team and grow as you ask questions.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Resources"
        description="Clinician-curated materials drawn from Devy's knowledge base."
      />

      {/* Category filter tabs */}
      {showFilter && (
        <div className="flex gap-1 bg-surface rounded-card p-1 mb-8 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-4 py-2 rounded-md text-body-sm font-medium whitespace-nowrap flex-shrink-0 focus-ring capitalize',
                activeCategory === cat
                  ? 'bg-white text-ink shadow-card'
                  : 'text-ink-secondary hover:text-ink'
              )}
              style={{ transitionProperty: 'background-color, color, box-shadow', transitionDuration: '150ms' }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Resource grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((doc) => {
          const displayTag = getDisplayTag(doc)
          const tagColor = TAG_COLOR_MAP[displayTag] ?? 'bg-raised text-ink-secondary'
          const isPubMed = doc.tags.includes('pubmed-auto')

          return (
            <div
              key={doc.id}
              className="bg-white rounded-card-lg shadow-card border border-border/50 p-5 flex flex-col gap-3 hover:shadow-card-hover hover:border-sage-200 group"
              style={{ transitionProperty: 'box-shadow, border-color', transitionDuration: '200ms' }}
            >
              {/* Tag + file type */}
              <div className="flex items-start justify-between gap-2">
                <span className={`inline-block px-2.5 py-0.5 rounded-pill text-body-xs font-medium ${tagColor} capitalize`}>
                  {displayTag}
                </span>
                <span className="flex-shrink-0 mt-0.5">
                  {FILE_ICON_MAP[doc.type] ?? FILE_ICON_MAP.txt}
                </span>
              </div>

              {/* Title + source label */}
              <div className="flex-1">
                <h3 className="font-display text-[0.95rem] font-semibold text-ink group-hover:text-sage-700 leading-snug"
                  style={{ transitionProperty: 'color', transitionDuration: '150ms' }}>
                  {doc.title}
                </h3>
                <p className="text-body-xs text-ink-tertiary mt-1">
                  {isPubMed ? 'PubMed · peer-reviewed' : `Uploaded · ${doc.type.toUpperCase()}`}
                  {doc.processedAt && ` · ${new Date(doc.processedAt).getFullYear()}`}
                </p>
              </div>

              {/* Ask Devy */}
              <a
                href={`/chat`}
                className="inline-flex items-center gap-1.5 text-body-xs font-medium text-sage-600 hover:text-sage-700 focus-ring rounded"
                style={{ transitionProperty: 'color', transitionDuration: '150ms' }}
              >
                <MessageSquare size={12} strokeWidth={2} />
                Ask Devy about this
              </a>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-body-sm text-ink-tertiary">No resources in this category yet.</p>
        </div>
      )}
    </div>
  )
}
