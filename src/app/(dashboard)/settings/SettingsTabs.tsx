'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProfileSection } from '@/components/settings/ProfileSection'
import { AppearanceSection } from '@/components/settings/AppearanceSection'
import { AiTrustSection } from '@/components/settings/AiTrustSection'
import { PrivacyDataSection } from '@/components/settings/PrivacyDataSection'
import { BillingSection } from '@/components/settings/BillingSection'
import { cn } from '@/lib/utils'
import type { Profile, BillingStatus } from '@/lib/types'

const TABS = [
  { id: 'profile',    label: 'Profile' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'ai-trust',   label: 'AI & Trust' },
  { id: 'privacy',    label: 'Privacy & Data' },
  { id: 'billing',    label: 'Billing' },
]

interface AuditEntry {
  id: string
  event_type: string
  event_data: Record<string, unknown>
  created_at: string
}

interface SettingsTabsProps {
  profile: Profile
  auditLog: AuditEntry[]
  billingStatus: BillingStatus | null
}

export function SettingsTabs({ profile, auditLog, billingStatus }: SettingsTabsProps) {
  const searchParams = useSearchParams()
  // Allow deep-linking to billing tab via ?tab=billing (e.g. after Stripe redirect)
  const initialTab = TABS.some(t => t.id === searchParams.get('tab'))
    ? (searchParams.get('tab') ?? 'profile')
    : 'profile'
  const [activeTab, setActiveTab] = useState(initialTab)

  return (
    <>
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

      <div>
        {activeTab === 'profile'    && <ProfileSection profile={profile} />}
        {activeTab === 'appearance' && <AppearanceSection />}
        {activeTab === 'ai-trust'   && <AiTrustSection />}
        {activeTab === 'privacy'    && <PrivacyDataSection profile={profile} auditLog={auditLog} />}
        {activeTab === 'billing'    && billingStatus && (
          <BillingSection billingStatus={billingStatus} />
        )}
        {activeTab === 'billing'    && !billingStatus && (
          <div className="text-body-sm text-ink-tertiary p-6">
            Unable to load billing information. Please refresh the page.
          </div>
        )}
      </div>
    </>
  )
}
