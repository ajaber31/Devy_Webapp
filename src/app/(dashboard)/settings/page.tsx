import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { SettingsTabs } from './SettingsTabs'
import { getProfile } from '@/lib/actions/profile'

export default async function SettingsPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader
        title="Settings"
        description="Manage your profile, preferences, and trust settings."
      />
      <SettingsTabs profile={profile} />
    </div>
  )
}
