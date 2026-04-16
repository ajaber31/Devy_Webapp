import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner'
import { StatCard } from '@/components/dashboard/StatCard'
import { RecentConversations } from '@/components/dashboard/RecentConversations'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { PrivacyNotice } from '@/components/dashboard/PrivacyNotice'
import { PendingPlanBanner } from '@/components/dashboard/PendingPlanBanner'
import { AnimateIn } from '@/components/shared/AnimateIn'
import { getProfile } from '@/lib/actions/profile'
import { getRoleTerminology } from '@/lib/role-terminology'
import { getConversationCount, getConversations, getUserMessageCount } from '@/lib/actions/conversations'
import { getChildrenCount } from '@/lib/actions/children'
import { getBillingStatus } from '@/lib/actions/billing'
import { getLang } from '@/lib/i18n/server'
import { getT } from '@/lib/i18n'

export default async function DashboardPage() {
  const [profile, conversationCount, childrenCount, messageCount, conversations, billingStatus, lang] = await Promise.all([
    getProfile(),
    getConversationCount(),
    getChildrenCount(),
    getUserMessageCount(),
    getConversations(),
    getBillingStatus(),
    getLang(),
  ])

  const t = getT(lang)
  const firstName = profile?.name.split(' ')[0] ?? 'there'
  const terms = getRoleTerminology(profile?.role ?? 'parent')
  const isFirstRun = conversationCount === 0 && childrenCount === 0

  const stats = [
    {
      label: t.dashboard.conversations,
      value: String(conversationCount),
      delta: t.dashboard.allTime,
      deltaDirection: 'neutral' as const,
      icon: 'MessageCircle',
      color: 'sage' as const,
    },
    {
      label: terms.statLabel,
      value: String(childrenCount),
      delta: t.dashboard.inYourAccount,
      deltaDirection: 'neutral' as const,
      icon: 'Users',
      color: 'dblue' as const,
    },
    {
      label: t.dashboard.questionsAsked,
      value: String(messageCount),
      delta: t.dashboard.acrossAllChats,
      deltaDirection: 'neutral' as const,
      icon: 'HelpCircle',
      color: 'sand' as const,
    },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome banner — no delay, first thing users see */}
      <AnimateIn distance={16}>
        <WelcomeBanner firstName={firstName} nounPlural={terms.nounPlural} isFirstVisit={isFirstRun} />
      </AnimateIn>

      {/* Pending plan banner — shown after signup from pricing page */}
      {billingStatus && (
        <AnimateIn delay={60} distance={16}>
          <PendingPlanBanner currentPlanId={billingStatus.planId} />
        </AnimateIn>
      )}

      {/* Stats row */}
      <AnimateIn delay={80} distance={16}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </AnimateIn>

      {/* Main content grid */}
      <AnimateIn delay={140} distance={16}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentConversations conversations={conversations.slice(0, 5)} />
          </div>
          <div className="space-y-5">
            <QuickActions nounPlural={terms.nounPlural} />
            <PrivacyNotice />
          </div>
        </div>
      </AnimateIn>
    </div>
  )
}
