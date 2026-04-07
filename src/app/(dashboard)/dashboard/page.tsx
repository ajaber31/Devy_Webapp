import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner'
import { StatCard } from '@/components/dashboard/StatCard'
import { RecentConversations } from '@/components/dashboard/RecentConversations'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { PrivacyNotice } from '@/components/dashboard/PrivacyNotice'
import { mockStats } from '@/lib/mock-data/resources'
import { getProfile } from '@/lib/actions/profile'
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

  const stats = mockStats.map(stat => {
    if (stat.label === 'Conversations') return { ...stat, value: String(conversationCount) }
    if (stat.label === 'Child Profiles')  return { ...stat, value: String(childrenCount) }
    if (stat.label === 'Questions Asked') return { ...stat, value: String(messageCount) }
    return stat
  })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <WelcomeBanner firstName={firstName} />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentConversations conversations={conversations.slice(0, 5)} />
        </div>
        <div className="space-y-5">
          <QuickActions />
          <PrivacyNotice />
        </div>
      </div>
    </div>
  )
}
