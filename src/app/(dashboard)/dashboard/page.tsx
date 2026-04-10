import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner'
import { StatCard } from '@/components/dashboard/StatCard'
import { RecentConversations } from '@/components/dashboard/RecentConversations'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { PrivacyNotice } from '@/components/dashboard/PrivacyNotice'
import { FirstRunBanner } from '@/components/dashboard/FirstRunBanner'
import { AnimateIn } from '@/components/shared/AnimateIn'
import { mockStats } from '@/lib/mock-data/resources'
import { getProfile } from '@/lib/actions/profile'
import { getRoleTerminology } from '@/lib/role-terminology'
import { getConversationCount, getConversations, getUserMessageCount } from '@/lib/actions/conversations'
import { getChildrenCount } from '@/lib/actions/children'

export default async function DashboardPage() {
  const [profile, conversationCount, childrenCount, messageCount, conversations] = await Promise.all([
    getProfile(),
    getConversationCount(),
    getChildrenCount(),
    getUserMessageCount(),
    getConversations(),
  ])

  const firstName = profile?.name.split(' ')[0] ?? 'there'
  const terms = getRoleTerminology(profile?.role ?? 'parent')
  const isFirstRun = conversationCount === 0 && childrenCount === 0

  const stats = mockStats.map(stat => {
    if (stat.label === 'Conversations') return { ...stat, value: String(conversationCount) }
    if (stat.label === 'Child Profiles')  return { ...stat, label: terms.statLabel, value: String(childrenCount) }
    if (stat.label === 'Questions Asked') return { ...stat, value: String(messageCount) }
    return stat
  })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome banner — no delay, first thing users see */}
      <AnimateIn distance={16}>
        <WelcomeBanner firstName={firstName} nounPlural={terms.nounPlural} />
      </AnimateIn>

      {/* First-run onboarding — only for brand-new accounts */}
      {isFirstRun && (
        <AnimateIn delay={80} distance={16}>
          <FirstRunBanner addLabel={terms.addLabel} nounSingular={terms.nounSingular} />
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
