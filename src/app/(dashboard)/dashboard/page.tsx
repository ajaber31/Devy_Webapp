import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner'
import { StatCard } from '@/components/dashboard/StatCard'
import { RecentConversations } from '@/components/dashboard/RecentConversations'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { PrivacyNotice } from '@/components/dashboard/PrivacyNotice'
import { FirstRunBanner } from '@/components/dashboard/FirstRunBanner'
import { PendingPlanBanner } from '@/components/dashboard/PendingPlanBanner'
import { AnimateIn } from '@/components/shared/AnimateIn'
import { getProfile } from '@/lib/actions/profile'
import { getRoleTerminology } from '@/lib/role-terminology'
import { getConversationCount, getConversations, getUserMessageCount } from '@/lib/actions/conversations'
import { getChildrenCount } from '@/lib/actions/children'
import { getReadyDocumentCount } from '@/lib/actions/documents'
import { getBillingStatus } from '@/lib/actions/billing'

export default async function DashboardPage() {
  const [profile, conversationCount, childrenCount, messageCount, conversations, documentCount, billingStatus] = await Promise.all([
    getProfile(),
    getConversationCount(),
    getChildrenCount(),
    getUserMessageCount(),
    getConversations(),
    getReadyDocumentCount(),
    getBillingStatus(),
  ])

  const firstName = profile?.name.split(' ')[0] ?? 'there'
  const terms = getRoleTerminology(profile?.role ?? 'parent')
  const isFirstRun = conversationCount === 0 && childrenCount === 0

  const stats = [
    {
      label: 'Conversations',
      value: String(conversationCount),
      delta: 'All time',
      deltaDirection: 'neutral' as const,
      icon: 'MessageCircle',
      color: 'sage' as const,
    },
    {
      label: terms.statLabel,
      value: String(childrenCount),
      delta: 'In your account',
      deltaDirection: 'neutral' as const,
      icon: 'Users',
      color: 'dblue' as const,
    },
    {
      label: 'Questions Asked',
      value: String(messageCount),
      delta: 'Across all chats',
      deltaDirection: 'neutral' as const,
      icon: 'HelpCircle',
      color: 'sand' as const,
    },
    {
      label: 'Knowledge Base Documents',
      value: String(documentCount),
      delta: 'Ready to query',
      deltaDirection: 'neutral' as const,
      icon: 'FileCheck',
      color: 'neutral' as const,
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

      {/* First-run onboarding — only for brand-new accounts */}
      {isFirstRun && (
        <AnimateIn delay={80} distance={16}>
          <FirstRunBanner />
        </AnimateIn>
      )}

      {/* Stats row */}
      <AnimateIn delay={isFirstRun ? 160 : 80} distance={16}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </AnimateIn>

      {/* Main content grid */}
      <AnimateIn delay={isFirstRun ? 220 : 140} distance={16}>
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
