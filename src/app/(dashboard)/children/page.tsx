import { PageHeader } from '@/components/shared/PageHeader'
import { ChildCard } from '@/components/children/ChildCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { AddChildButton } from './AddChildButton'
import { getChildren } from '@/lib/actions/children'
import { Users2 } from 'lucide-react'

export default async function ChildrenPage() {
  const children = await getChildren()

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6">
        <PageHeader
          title="My Children"
          description="Profiles you're actively supporting. Start a conversation or explore each child's profile."
        />
        <AddChildButton />
      </div>

      {children.length === 0 ? (
        <EmptyState
          icon={<Users2 size={28} strokeWidth={1.5} />}
          title="No children yet"
          description="Add a child profile to start organising your conversations and getting personalised support."
          action={<AddChildButton />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {children.map((child) => (
            <ChildCard key={child.id} child={child} />
          ))}
        </div>
      )}
    </div>
  )
}
