'use client'

import { useState } from 'react'
import { Upload } from 'lucide-react'
import { mockCurrentUser } from '@/lib/mock-data/users'

export function OrgBrandingSection() {
  const [orgName, setOrgName] = useState(mockCurrentUser.organization ?? '')
  const [primaryColor, setPrimaryColor] = useState('#5C8651')
  const [saved, setSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-card-lg shadow-card border border-border/50 p-6">
        <h3 className="font-display text-display-sm font-semibold text-ink mb-1">Organization branding</h3>
        <p className="text-body-sm text-ink-secondary mb-6">Customize how Devy appears to your team.</p>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Logo upload */}
          <div>
            <label className="block text-body-sm font-medium text-ink mb-2">Organization logo</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-card bg-surface border border-border flex items-center justify-center">
                <span className="text-body-xs font-semibold text-ink-tertiary">{orgName.slice(0, 2).toUpperCase()}</span>
              </div>
              <div className="flex-1">
                <div className="border-2 border-dashed border-border rounded-card p-4 text-center hover:border-sage-300 hover:bg-sage-50 cursor-pointer"
                  style={{ transitionProperty: 'border-color, background-color', transitionDuration: '150ms' }}>
                  <Upload size={16} className="text-ink-tertiary mx-auto mb-1.5" />
                  <p className="text-body-xs text-ink-secondary">Click to upload PNG or SVG</p>
                  <p className="text-body-xs text-ink-tertiary">Recommended: 200×200px</p>
                </div>
              </div>
            </div>
          </div>

          {/* Org name */}
          <div>
            <label htmlFor="org-name" className="block text-body-sm font-medium text-ink mb-1.5">Organization name</label>
            <input
              id="org-name"
              type="text"
              value={orgName}
              onChange={e => setOrgName(e.target.value)}
              className="w-full max-w-md px-4 py-2.5 bg-surface border border-border rounded-card text-body-sm text-ink shadow-input focus:outline-none focus:shadow-input-focus focus:border-sage-400"
              style={{ transitionProperty: 'border-color, box-shadow', transitionDuration: '150ms' }}
            />
          </div>

          {/* Primary color */}
          <div>
            <label htmlFor="primary-color" className="block text-body-sm font-medium text-ink mb-1.5">Primary color</label>
            <div className="flex items-center gap-3">
              <input
                id="primary-color"
                type="color"
                value={primaryColor}
                onChange={e => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded-card border border-border cursor-pointer p-0.5 bg-white focus-ring"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={e => setPrimaryColor(e.target.value)}
                className="w-28 px-3 py-2 bg-surface border border-border rounded-card text-body-sm text-ink font-mono shadow-input focus:outline-none focus:shadow-input-focus focus:border-sage-400"
                style={{ transitionProperty: 'border-color, box-shadow', transitionDuration: '150ms' }}
              />
              <div className="h-9 w-20 rounded-card shadow-card" style={{ backgroundColor: primaryColor }} />
            </div>
            <p className="text-body-xs text-ink-tertiary mt-1.5">Used for buttons and active navigation states.</p>
          </div>

          <div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-sage-500 text-white font-medium text-body-sm rounded-pill shadow-button hover:bg-sage-600 hover:shadow-button-hover active:scale-[0.98] focus-ring"
              style={{ transitionProperty: 'background-color, box-shadow, transform', transitionDuration: '150ms' }}
            >
              {saved ? '✓ Saved' : 'Save branding'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
