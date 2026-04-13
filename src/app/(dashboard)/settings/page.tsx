import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { SettingsTabs } from './SettingsTabs'
import { getProfile } from '@/lib/actions/profile'
import { getPrivacyAuditLog } from '@/lib/actions/privacy'
import { getBillingStatus } from '@/lib/actions/billing'

export default async function SettingsPage() {
  const [profile, auditLog, billingStatus] = await Promise.all([
    getProfile(),
    getPrivacyAuditLog(),
    getBillingStatus(),
  ])

  if (!profile) redirect('/login')

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader
        title="Settings"
        description="Manage your profile, preferences, and trust settings."
      />
      <SettingsTabs profile={profile} auditLog={auditLog} billingStatus={billingStatus} />
    </div>
  )
}
