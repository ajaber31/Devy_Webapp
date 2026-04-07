import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner'
import { StatCard } from '@/components/dashboard/StatCard'
import { RecentConversations } from '@/components/dashboard/RecentConversations'
import { PinnedResources } from '@/components/dashboard/PinnedResources'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { mockStats } from '@/lib/mock-data/resources'
import { getProfile } from '@/lib/actions/profile'
import { getConversationCount, getConversations } from '@/lib/actions/conversations'

export default async function DashboardPage() {
  const [profile, conversationCount, conversations] = await Promise.all([
    getProfile(),
    getConversationCount(),
    getConversations(),
  ])

  const firstName = profile?.name.split(' ')[0] ?? 'there'

  // Replace the conversations stat with the real count; keep other stats as mock for now
  const stats = mockStats.map(stat =>
    stat.label === 'Conversations'
      ? { ...stat, value: String(conversationCount) }
      : stat
  )

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
          <PinnedResources />
          <QuickActions />
        </div>
      </div>
    </div>
  )
}
