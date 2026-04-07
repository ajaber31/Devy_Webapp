'use client'

import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { mockResources } from '@/lib/mock-data/resources'
import { cn } from '@/lib/utils'

const CATEGORIES = ['All', 'IEP Support', 'Sensory', 'Behavior', 'Communication', 'Daily Living']

const categoryColorMap: Record<string, string> = {
  'IEP Support':   'bg-sage-100 text-sage-700',
  'Sensory':       'bg-dblue-100 text-dblue-700',
  'Behavior':      'bg-sand-100 text-sand-600',
  'Communication': 'bg-sage-100 text-sage-600',
  'Daily Living':  'bg-raised text-ink-secondary',
}

export default function ResourcesPage() {
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = activeCategory === 'All'
    ? mockResources
    : mockResources.filter(r => r.category === activeCategory)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Resources"
        description="Curated materials drawn from Devy&apos;s centrally approved knowledge base."
      />

      {/* Category filter tabs */}
      <div className="flex gap-1 bg-surface rounded-card p-1 mb-8 overflow-x-auto">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'px-4 py-2 rounded-md text-body-sm font-medium whitespace-nowrap flex-shrink-0 focus-ring',
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

      {/* Resource grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((resource) => (
          <a
            key={resource.id}
            href={resource.href}
            className="bg-white rounded-card-lg shadow-card border border-border/50 p-5 group hover:shadow-card-hover hover:border-sage-200 flex flex-col gap-3 focus-ring"
            style={{ transitionProperty: 'box-shadow, border-color', transitionDuration: '200ms' }}
          >
            <div className="flex items-start justify-between gap-2">
              <span className={`inline-block px-2.5 py-0.5 rounded-pill text-body-xs font-medium ${categoryColorMap[resource.category] ?? 'bg-raised text-ink-secondary'}`}>
                {resource.category}
              </span>
              <ExternalLink
                size={14}
                strokeWidth={1.75}
                className="text-ink-tertiary group-hover:text-sage-500 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100"
                style={{ transitionProperty: 'opacity, color', transitionDuration: '150ms' }}
              />
            </div>
            <div>
              <h3 className="font-display text-[0.95rem] font-semibold text-ink group-hover:text-sage-700 leading-snug"
                style={{ transitionProperty: 'color', transitionDuration: '150ms' }}>
                {resource.title}
              </h3>
              <p className="text-body-xs text-ink-secondary mt-1 leading-relaxed">
                {resource.description}
              </p>
            </div>
          </a>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-body-sm text-ink-tertiary">No resources in this category yet.</p>
        </div>
      )}
    </div>
  )
}
