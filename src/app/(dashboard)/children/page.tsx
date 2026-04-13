import { PageHeader } from '@/components/shared/PageHeader'
import { ChildCard } from '@/components/children/ChildCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { AnimateIn } from '@/components/shared/AnimateIn'
import { AddChildButton } from './AddChildButton'
import { getChildren } from '@/lib/actions/children'
import { getProfile } from '@/lib/actions/profile'
import { getBillingStatus } from '@/lib/actions/billing'
import { getRoleTerminology } from '@/lib/role-terminology'
import { Users2 } from 'lucide-react'

export default async function ChildrenPage() {
  const [children, profile, billingStatus] = await Promise.all([
    getChildren(),
    getProfile(),
    getBillingStatus(),
  ])
  const terms = getRoleTerminology(profile?.role ?? 'parent')

  // Plan limit enforcement for the UI — actual enforcement is in createChild() server action
  const planLimitReached = billingStatus !== null && (
    billingStatus.childLimit !== -1 &&
    billingStatus.childCount >= billingStatus.childLimit
  )
  const currentPlanId = billingStatus?.planId ?? 'free'

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6">
        <PageHeader
          title={terms.possessive}
          description={`Profiles you're actively supporting. Start a conversation or explore each ${terms.nounSingular.toLowerCase()}'s profile.`}
        />
        <AddChildButton
          label={terms.addLabel}
          modalTitle={`Add a ${terms.nounSingular.toLowerCase()} profile`}
          planLimitReached={planLimitReached}
          currentPlanId={currentPlanId}
        />
      </div>

      {children.length === 0 ? (
        <AnimateIn delay={80}>
          <EmptyState
            icon={<Users2 size={28} strokeWidth={1.5} />}
            title={terms.emptyTitle}
            description={terms.emptyDescription}
            action={
              <AddChildButton
                label={terms.addLabel}
                modalTitle={`Add a ${terms.nounSingular.toLowerCase()} profile`}
                planLimitReached={planLimitReached}
                currentPlanId={currentPlanId}
              />
            }
          />
        </AnimateIn>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {children.map((child, i) => (
            <AnimateIn key={child.id} delay={i * 70}>
              <ChildCard child={child} />
            </AnimateIn>
          ))}
        </div>
      )}
    </div>
  )
}
