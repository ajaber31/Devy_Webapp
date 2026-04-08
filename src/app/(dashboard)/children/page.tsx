import { PageHeader } from '@/components/shared/PageHeader'
import { ChildCard } from '@/components/children/ChildCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { AddChildButton } from './AddChildButton'
import { getChildren } from '@/lib/actions/children'
import { getProfile } from '@/lib/actions/profile'
import { getRoleTerminology } from '@/lib/role-terminology'
import { Users2 } from 'lucide-react'

export default async function ChildrenPage() {
  const [children, profile] = await Promise.all([getChildren(), getProfile()])
  const terms = getRoleTerminology(profile?.role ?? 'parent')

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6">
        <PageHeader
          title={terms.possessive}
          description={`Profiles you're actively supporting. Start a conversation or explore each ${terms.nounSingular.toLowerCase()}'s profile.`}
        />
        <AddChildButton label={terms.addLabel} />
      </div>

      {children.length === 0 ? (
        <EmptyState
          icon={<Users2 size={28} strokeWidth={1.5} />}
          title={terms.emptyTitle}
          description={terms.emptyDescription}
          action={<AddChildButton label={terms.addLabel} />}
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
