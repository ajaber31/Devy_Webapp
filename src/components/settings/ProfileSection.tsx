'use client'

import { useState } from 'react'
import { Camera } from 'lucide-react'
import { updateProfile } from '@/lib/actions/profile'
import { initials } from '@/lib/utils'
import type { Profile } from '@/lib/types'

interface ProfileSectionProps {
  profile: Profile
}

export function ProfileSection({ profile }: ProfileSectionProps) {
  const [name, setName] = useState(profile.name)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    const result = await updateProfile({ name })
    if (result?.error) {
      setError(result.error)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
    setSaving(false)
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-card-lg shadow-card border border-border/50 p-6">
        <h3 className="font-display text-display-sm font-semibold text-ink mb-5">Personal information</h3>

        {/* Avatar */}
        <div className="flex items-center gap-5 mb-7">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-sage-200 text-sage-800 flex items-center justify-center text-2xl font-bold font-display">
              {initials(profile.name)}
            </div>
            <button
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-sage-500 text-white flex items-center justify-center shadow-button hover:bg-sage-600 focus-ring"
              style={{ transitionProperty: 'background-color', transitionDuration: '150ms' }}
              aria-label="Change avatar"
              type="button"
            >
              <Camera size={13} strokeWidth={2} />
            </button>
          </div>
          <div>
            <p className="text-body-sm font-medium text-ink">{name}</p>
            <p className="text-body-xs text-ink-tertiary capitalize">{profile.role}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="profile-name" className="block text-body-sm font-medium text-ink mb-1.5">Full name</label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface border border-border rounded-card text-body-sm text-ink shadow-input focus:outline-none focus:shadow-input-focus focus:border-sage-400"
              style={{ transitionProperty: 'border-color, box-shadow', transitionDuration: '150ms' }}
            />
          </div>

          <div>
            <label htmlFor="profile-email" className="block text-body-sm font-medium text-ink mb-1.5">Email address</label>
            <input
              id="profile-email"
              type="email"
              value={profile.email}
              readOnly
              className="w-full px-4 py-2.5 bg-surface border border-border rounded-card text-body-sm text-ink-secondary shadow-input cursor-not-allowed"
              title="Email cannot be changed here"
            />
          </div>

          {error && (
            <div className="sm:col-span-2 px-4 py-2.5 bg-danger/5 border border-danger/20 rounded-card">
              <p className="text-body-xs text-danger">{error}</p>
            </div>
          )}

          <div className="sm:col-span-2 flex items-center justify-between">
            <div>
              <label className="block text-body-sm font-medium text-ink mb-0.5">Account type</label>
              <p className="text-body-xs text-ink-tertiary capitalize">{profile.role}</p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-sage-500 text-white font-medium text-body-sm rounded-pill shadow-button hover:bg-sage-600 hover:shadow-button-hover active:scale-[0.98] focus-ring disabled:opacity-60"
              style={{ transitionProperty: 'background-color, box-shadow, transform', transitionDuration: '150ms' }}
            >
              {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
