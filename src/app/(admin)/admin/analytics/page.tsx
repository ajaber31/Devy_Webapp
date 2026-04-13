import { redirect } from 'next/navigation'
import { getAnalytics } from '@/lib/actions/admin'
import { PageHeader } from '@/components/shared/PageHeader'
import { AnalyticsDashboard } from './AnalyticsDashboard'

export const metadata = { title: 'Analytics — Devy Admin' }

export default async function AnalyticsPage() {
  const analytics = await getAnalytics()
  if (!analytics) redirect('/dashboard')

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Analytics"
        description="Platform-wide metrics across users, subscriptions, and engagement."
      />
      <AnalyticsDashboard data={analytics} />
    </div>
  )
}
