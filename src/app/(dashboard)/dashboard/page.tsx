import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner'
import { StatCard } from '@/components/dashboard/StatCard'
import { RecentConversations } from '@/components/dashboard/RecentConversations'
import { PinnedResources } from '@/components/dashboard/PinnedResources'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { mockStats } from '@/lib/mock-data/resources'

export default function DashboardPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <WelcomeBanner />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {mockStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/center: recent conversations — takes 2 cols */}
        <div className="lg:col-span-2">
          <RecentConversations />
        </div>

        {/* Right: pinned resources + quick actions */}
        <div className="space-y-5">
          <PinnedResources />
          <QuickActions />
        </div>
      </div>
    </div>
  )
}
