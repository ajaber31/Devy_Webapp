'use client'

import { useState } from 'react'

interface ToggleRowProps {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-6 py-4 border-b border-border/50 last:border-0">
      <div>
        <p className="text-body-sm font-medium text-ink">{label}</p>
        <p className="text-body-xs text-ink-secondary mt-0.5">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`flex-shrink-0 w-10 h-5.5 rounded-full relative mt-0.5 focus-ring ${checked ? 'bg-sage-500' : 'bg-border'}`}
        style={{ height: '22px', transitionProperty: 'background-color', transitionDuration: '200ms' }}
      >
        <span
          className="absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-white shadow-card"
          style={{
            transform: checked ? 'translateX(18px)' : 'translateX(0)',
            transitionProperty: 'transform',
            transitionDuration: '200ms',
            transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />
      </button>
    </div>
  )
}

const defaults = {
  emailNewConvo:  true,
  emailWeekly:    true,
  emailActivity:  false,
  pushMessages:   true,
  pushUpdates:    false,
}

export function NotificationsSection() {
  const [prefs, setPrefs] = useState(defaults)
  const set = (key: keyof typeof defaults) => (v: boolean) =>
    setPrefs(prev => ({ ...prev, [key]: v }))

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-card-lg shadow-card border border-border/50 p-6">
        <h3 className="font-display text-display-sm font-semibold text-ink mb-1">Email notifications</h3>
        <p className="text-body-sm text-ink-secondary mb-4">Choose what emails you receive from Devy.</p>
        <div>
          <ToggleRow label="New conversation summaries" description="Get a brief summary when a conversation is completed." checked={prefs.emailNewConvo} onChange={set('emailNewConvo')} />
          <ToggleRow label="Weekly usage digest" description="A weekly summary of your activity and knowledge base updates." checked={prefs.emailWeekly} onChange={set('emailWeekly')} />
          <ToggleRow label="Team activity" description="Notifications when team members share or pin resources." checked={prefs.emailActivity} onChange={set('emailActivity')} />
        </div>
      </div>

      <div className="bg-white rounded-card-lg shadow-card border border-border/50 p-6">
        <h3 className="font-display text-display-sm font-semibold text-ink mb-1">In-app notifications</h3>
        <p className="text-body-sm text-ink-secondary mb-4">Control what appears in your notification center.</p>
        <div>
          <ToggleRow label="New AI responses" description="Notify when an AI response is ready in a long-running conversation." checked={prefs.pushMessages} onChange={set('pushMessages')} />
          <ToggleRow label="Knowledge base updates" description="Notify when new documents are added to the knowledge base." checked={prefs.pushUpdates} onChange={set('pushUpdates')} />
        </div>
      </div>
    </div>
  )
}
