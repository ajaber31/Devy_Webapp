'use client'

import { useState } from 'react'
import { ShieldCheck, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TrustToggleProps {
  label: string
  description: string
  detail: string
  checked: boolean
  onChange: (v: boolean) => void
  recommended?: boolean
}

function TrustToggle({ label, description, detail, checked, onChange, recommended }: TrustToggleProps) {
  return (
    <div className={cn('flex items-start gap-4 py-5 border-b border-border/50 last:border-0', checked && 'bg-transparent')}>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`flex-shrink-0 w-10 rounded-full relative mt-0.5 focus-ring`}
        style={{
          height: '22px',
          backgroundColor: checked ? '#5C8651' : '#DDD9D0',
          transitionProperty: 'background-color',
          transitionDuration: '200ms',
        }}
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
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-body-sm font-medium text-ink">{label}</p>
          {recommended && (
            <span className="px-1.5 py-0.5 bg-sage-100 text-sage-700 text-[0.65rem] font-semibold rounded uppercase tracking-wide">
              Recommended
            </span>
          )}
        </div>
        <p className="text-body-sm text-ink-secondary">{description}</p>
        <div className="flex items-start gap-1.5 mt-2">
          <Info size={12} className="text-ink-tertiary flex-shrink-0 mt-0.5" />
          <p className="text-body-xs text-ink-tertiary leading-relaxed">{detail}</p>
        </div>
      </div>
    </div>
  )
}

const defaults = {
  citations:        true,
  reviewClinical:   true,
  contentFilter:    true,
  notFoundNotices:  true,
  analytics:        false,
}

export function AiTrustSection() {
  const [settings, setSettings] = useState(defaults)
  const set = (key: keyof typeof defaults) => (v: boolean) =>
    setSettings(prev => ({ ...prev, [key]: v }))

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-card-lg shadow-card border border-border/50 p-6">
        <div className="flex items-center gap-2.5 mb-1">
          <ShieldCheck size={18} className="text-sage-500" strokeWidth={2} />
          <h3 className="font-display text-display-sm font-semibold text-ink">AI Trust & Safety</h3>
        </div>
        <p className="text-body-sm text-ink-secondary mb-5">
          These settings control how Devy presents and qualifies its answers. Recommended settings are pre-selected to ensure the highest level of transparency.
        </p>

        <TrustToggle
          label="Show source citations on all answers"
          description="Every AI response displays source cards indicating which document the information was drawn from."
          detail="Disabling this hides citations but does not change how Devy generates responses. We strongly recommend keeping this on."
          checked={settings.citations}
          onChange={set('citations')}
          recommended
        />
        <TrustToggle
          label="Flag clinical suggestions for human review"
          description="Adds a visible notice on responses that involve clinical recommendations, reminding clinicians to apply professional judgment."
          detail="Intended for use by organizations where AI-supported clinical guidance is provided to non-clinician users."
          checked={settings.reviewClinical}
          onChange={set('reviewClinical')}
          recommended
        />
        <TrustToggle
          label="Content safety filter"
          description="Prevents Devy from responding to questions outside its educational/support scope, such as requests for medical diagnoses."
          detail="This filter is broad by design. If legitimate questions are being blocked, contact your account manager."
          checked={settings.contentFilter}
          onChange={set('contentFilter')}
          recommended
        />
        <TrustToggle
          label="Show 'Not found' notices"
          description="When information requested isn't available in the knowledge base, Devy displays a clear 'Not found in current materials' notice rather than speculating."
          detail="Disabling this will cause Devy to omit the notice, which may reduce transparency. We recommend leaving this on."
          checked={settings.notFoundNotices}
          onChange={set('notFoundNotices')}
          recommended
        />
        <TrustToggle
          label="Share anonymous usage analytics"
          description="Help us improve Devy by sharing anonymized query patterns and feature usage data. No personal or patient data is ever included."
          detail="Data is aggregated and cannot be traced back to individual users or organizations."
          checked={settings.analytics}
          onChange={set('analytics')}
        />
      </div>

      <div className="bg-sage-50 border border-sage-200 rounded-card-lg px-5 py-4 flex items-start gap-3">
        <ShieldCheck size={18} className="text-sage-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
        <p className="text-body-sm text-sage-800 leading-relaxed">
          <strong>Devy is an informational tool.</strong> It does not provide medical advice, and responses should always be reviewed by qualified professionals before being acted upon in a clinical context. These settings help surface that transparency clearly to your users.
        </p>
      </div>
    </div>
  )
}
