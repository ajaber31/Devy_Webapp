import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { ChildCard } from '@/components/children/ChildCard'
import { mockChildren } from '@/lib/mock-data/children'

export default function ChildrenPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6">
        <PageHeader
          title="My Children"
          description="Profiles you&apos;re actively supporting. Start a conversation or explore each child&apos;s profile."
        />
        <button
          className="flex items-center gap-2 px-4 py-2.5 bg-sage-500 text-white font-semibold text-body-sm rounded-card shadow-button hover:bg-sage-600 active:scale-[0.98] flex-shrink-0 focus-ring"
          style={{ transitionProperty: 'background-color, transform', transitionDuration: '150ms' }}
        >
          <Plus size={15} strokeWidth={2.5} />
          Add Child
        </button>
      </div>

      {mockChildren.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center mb-4">
            <Plus size={24} className="text-sage-600" strokeWidth={1.75} />
          </div>
          <h3 className="font-display text-display-sm font-semibold text-ink mb-2">No children yet</h3>
          <p className="text-body-sm text-ink-secondary max-w-sm">
            Add a child profile to start organizing your conversations and getting personalized support.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {mockChildren.map((child) => (
            <ChildCard key={child.id} child={child} />
          ))}
        </div>
      )}
    </div>
  )
}
