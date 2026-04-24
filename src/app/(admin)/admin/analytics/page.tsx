import { redirect } from 'next/navigation'
import { getAnalytics } from '@/lib/actions/admin'
import { PageHeader } from '@/components/shared/PageHeader'
import { AnalyticsDashboard } from './AnalyticsDashboard'
import { getLang } from '@/lib/i18n/server'
import { getT } from '@/lib/i18n'

export const metadata = { title: 'Analytics — Devy Admin' }

export default async function AnalyticsPage() {
  const [analytics, lang] = await Promise.all([getAnalytics(), getLang()])
  if (!analytics) redirect('/dashboard')
  const t = getT(lang)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title={t.admin.analytics.title}
        description={t.admin.analytics.description}
      />
      <AnalyticsDashboard data={analytics} />
    </div>
  )
}
