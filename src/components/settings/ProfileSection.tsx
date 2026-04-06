'use client'

import { useState } from 'react'
import { Camera } from 'lucide-react'
import { mockCurrentUser } from '@/lib/mock-data/users'

export function ProfileSection() {
  const [form, setForm] = useState({
    name: mockCurrentUser.name,
    email: mockCurrentUser.email,
    organization: mockCurrentUser.organization ?? '',
    bio: 'Occupational therapist and lead clinician at BrightPath Therapy. Focused on sensory processing and early intervention.',
  })
  const [saved, setSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-card-lg shadow-card border border-border/50 p-6">
        <h3 className="font-display text-display-sm font-semibold text-ink mb-5">Personal information</h3>

        {/* Avatar */}
        <div className="flex items-center gap-5 mb-7">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-sage-200 text-sage-800 flex items-center justify-center text-2xl font-bold font-display">
              AR
            </div>
            <button
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-sage-500 text-white flex items-center justify-center shadow-button hover:bg-sage-600 focus-ring"
              style={{ transitionProperty: 'background-color', transitionDuration: '150ms' }}
              aria-label="Change avatar"
            >
              <Camera size={13} strokeWidth={2} />
            </button>
          </div>
          <div>
            <p className="text-body-sm font-medium text-ink">{form.name}</p>
            <p className="text-body-xs text-ink-tertiary capitalize">{mockCurrentUser.role} · {form.organization}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { id: 'name', label: 'Full name', key: 'name' as const },
            { id: 'email', label: 'Email address', key: 'email' as const },
            { id: 'org', label: 'Organization', key: 'organization' as const },
          ].map(({ id, label, key }) => (
            <div key={id} className={key === 'email' ? '' : ''}>
              <label htmlFor={id} className="block text-body-sm font-medium text-ink mb-1.5">{label}</label>
              <input
                id={id}
                type={key === 'email' ? 'email' : 'text'}
                value={form[key]}
                onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                className="w-full px-4 py-2.5 bg-surface border border-border rounded-card text-body-sm text-ink shadow-input focus:outline-none focus:shadow-input-focus focus:border-sage-400"
                style={{ transitionProperty: 'border-color, box-shadow', transitionDuration: '150ms' }}
              />
            </div>
          ))}

          <div className="sm:col-span-2">
            <label htmlFor="bio" className="block text-body-sm font-medium text-ink mb-1.5">Bio</label>
            <textarea
              id="bio"
              rows={3}
              value={form.bio}
              onChange={e => setForm(prev => ({ ...prev, bio: e.target.value }))}
              className="w-full px-4 py-2.5 bg-surface border border-border rounded-card text-body-sm text-ink shadow-input focus:outline-none focus:shadow-input-focus focus:border-sage-400 resize-none"
              style={{ transitionProperty: 'border-color, box-shadow', transitionDuration: '150ms' }}
            />
          </div>

          <div className="sm:col-span-2 flex items-center justify-between">
            <div>
              <label className="block text-body-sm font-medium text-ink mb-0.5">Account type</label>
              <p className="text-body-xs text-ink-tertiary capitalize">{mockCurrentUser.role} — contact your admin to change</p>
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-sage-500 text-white font-medium text-body-sm rounded-pill shadow-button hover:bg-sage-600 hover:shadow-button-hover active:scale-[0.98] focus-ring"
              style={{ transitionProperty: 'background-color, box-shadow, transform', transitionDuration: '150ms' }}
            >
              {saved ? '✓ Saved' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
