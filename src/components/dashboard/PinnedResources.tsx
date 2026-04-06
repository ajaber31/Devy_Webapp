import Link from 'next/link'
import { Bookmark, ExternalLink } from 'lucide-react'
import { mockResources } from '@/lib/mock-data/resources'

const categoryColors: Record<string, string> = {
  'IEP Support':  'bg-dblue-100 text-dblue-700',
  'Sensory':      'bg-sage-100 text-sage-700',
  'Behavior':     'bg-sand-100 text-sand-500',
  'Communication':'bg-dblue-100 text-dblue-700',
  'Daily Living': 'bg-raised text-ink-secondary',
}

export function PinnedResources() {
  const pinned = mockResources.filter(r => r.isPinned)

  return (
    <div className="bg-white rounded-card-lg shadow-card border border-border/50 overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-2">
        <Bookmark size={16} className="text-dblue-500" strokeWidth={2} />
        <h3 className="font-display text-[1.05rem] font-semibold text-ink">Pinned resources</h3>
      </div>
      <ul className="divide-y divide-border/50">
        {pinned.map((resource) => (
          <li key={resource.id}>
            <Link
              href={resource.href}
              className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-surface group"
              style={{ transitionProperty: 'background-color', transitionDuration: '150ms' }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-body-sm font-medium text-ink mb-0.5 group-hover:text-sage-700 transition-colors duration-150">{resource.title}</p>
                <p className="text-body-xs text-ink-tertiary truncate">{resource.description}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`px-2 py-0.5 rounded text-body-xs font-medium ${categoryColors[resource.category] ?? 'bg-raised text-ink-secondary'}`}>
                  {resource.category}
                </span>
                <ExternalLink size={13} className="text-ink-tertiary group-hover:text-sage-500 transition-colors duration-150" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
