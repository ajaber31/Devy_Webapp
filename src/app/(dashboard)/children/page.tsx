import { PageHeader } from '@/components/shared/PageHeader'
import { ChildCard } from '@/components/children/ChildCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { AnimateIn } from '@/components/shared/AnimateIn'
import { AddChildButton } from './AddChildButton'
import { getChildren } from '@/lib/actions/children'
import { getProfile } from '@/lib/actions/profile'
import { getBillingStatus } from '@/lib/actions/billing'
import { getRoleTerminology } from '@/lib/role-terminology'
import { getLang } from '@/lib/i18n/server'
import { getT } from '@/lib/i18n'
import { Users2 } from 'lucide-react'

export default async function ChildrenPage() {
  const [childList, profile, billingStatus, lang] = await Promise.all([
    getChildren(),
    getProfile(),
    getBillingStatus(),
    getLang(),
  ])
  const t = getT(lang)
  const tc = t.children
  const terms = getRoleTerminology(profile?.role ?? 'parent', lang)

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
          description={tc.pageDescription.replace('{noun}', terms.nounSingular.toLowerCase())}
        />
        <AddChildButton
          label={terms.addLabel}
          modalTitle={tc.addProfileModal.replace('{noun}', terms.nounSingular.toLowerCase())}
          planLimitReached={planLimitReached}
          currentPlanId={currentPlanId}
        />
      </div>

      {childList.length === 0 ? (
        <AnimateIn delay={80}>
          <EmptyState
            icon={<Users2 size={28} strokeWidth={1.5} />}
            title={terms.emptyTitle}
            description={terms.emptyDescription}
            action={
              <AddChildButton
                label={terms.addLabel}
                modalTitle={tc.addProfileModal.replace('{noun}', terms.nounSingular.toLowerCase())}
                planLimitReached={planLimitReached}
                currentPlanId={currentPlanId}
              />
            }
          />
        </AnimateIn>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {childList.map((child, i) => (
            <AnimateIn key={child.id} delay={i * 70}>
              <ChildCard child={child} />
            </AnimateIn>
          ))}
        </div>
      )}
    </div>
  )
}
