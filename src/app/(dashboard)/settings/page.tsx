import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { SettingsTabs } from './SettingsTabs'
import { getProfile } from '@/lib/actions/profile'
import { getPrivacyAuditLog } from '@/lib/actions/privacy'
import { getBillingStatus } from '@/lib/actions/billing'
import { getLang } from '@/lib/i18n/server'
import { getT } from '@/lib/i18n'

export default async function SettingsPage() {
  const [profile, auditLog, billingStatus, lang] = await Promise.all([
    getProfile(),
    getPrivacyAuditLog(),
    getBillingStatus(),
    getLang(),
  ])

  if (!profile) redirect('/login')

  const t = getT(lang)

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader
        title={t.settings.title}
        description={t.settings.description}
      />
      <SettingsTabs profile={profile} auditLog={auditLog} billingStatus={billingStatus} />
    </div>
  )
}
