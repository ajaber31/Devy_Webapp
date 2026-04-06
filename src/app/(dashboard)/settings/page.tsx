'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { ProfileSection } from '@/components/settings/ProfileSection'
import { NotificationsSection } from '@/components/settings/NotificationsSection'
import { AppearanceSection } from '@/components/settings/AppearanceSection'
import { OrgBrandingSection } from '@/components/settings/OrgBrandingSection'
import { AiTrustSection } from '@/components/settings/AiTrustSection'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'profile',       label: 'Profile' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'appearance',    label: 'Appearance' },
  { id: 'branding',      label: 'Org Branding' },
  { id: 'ai-trust',      label: 'AI & Trust' },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader
        title="Settings"
        description="Manage your profile, preferences, and platform configuration."
      />

      {/* Tab bar */}
      <div className="flex gap-1 bg-surface rounded-card p-1 mb-8 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2 rounded-md text-body-sm font-medium whitespace-nowrap flex-shrink-0 focus-ring',
              activeTab === tab.id
                ? 'bg-white text-ink shadow-card'
                : 'text-ink-secondary hover:text-ink'
            )}
            style={{ transitionProperty: 'background-color, color, box-shadow', transitionDuration: '150ms' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'profile'       && <ProfileSection />}
        {activeTab === 'notifications' && <NotificationsSection />}
        {activeTab === 'appearance'    && <AppearanceSection />}
        {activeTab === 'branding'      && <OrgBrandingSection />}
        {activeTab === 'ai-trust'      && <AiTrustSection />}
      </div>
    </div>
  )
}
