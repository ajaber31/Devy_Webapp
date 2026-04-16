'use client'

import { ShieldCheck, Lock, Info } from 'lucide-react'

export function AiTrustSection() {
  return (
    <div className="space-y-6">
      {/* Always-on disclosures required under PIPEDA / PHIPA */}
      <div className="bg-white rounded-card-lg shadow-card border border-border/50 p-6">
        <div className="flex items-center gap-2.5 mb-1">
          <ShieldCheck size={18} className="text-sage-500" strokeWidth={2} />
          <h3 className="font-display text-display-sm font-semibold text-ink">AI Trust & Safety</h3>
        </div>
        <p className="text-body-sm text-ink-secondary mb-6">
          The following safety measures are required by Devy&apos;s operating standards and applicable Canadian law (PIPEDA / PHIPA). They cannot be disabled.
        </p>

        <div className="space-y-5">
          <PolicyRow
            title="Clinical disclaimer on health responses"
            description="Every response that touches on clinical, medical, or therapeutic topics ends with a visible disclaimer reminding users to consult a qualified professional."
            legal="Required — PHIPA s.3(1) and professional standards for AI-assisted health information"
          />
          <PolicyRow
            title="Transparency about information sources"
            description="Devy prioritises its clinician-curated Knowledge Base and PubMed research. When context is unavailable, responses are drawn from GPT-4o's clinical training and are clearly distinguished from Knowledge Base-grounded answers."
            legal="Required — PIPEDA Principle 4.3 (Openness) and Principle 4.9 (Individual Access to accuracy)"
          />
          <PolicyRow
            title="No diagnosis rule"
            description="Devy will never suggest, imply, or state a clinical diagnosis. Questions requiring diagnosis are always redirected to a qualified health professional."
            legal="Required — Canadian health information regulations prohibit unqualified diagnostic claims"
          />
          <PolicyRow
            title="Source grounding policy"
            description="Substantive responses are grounded in Devy's clinician-curated Knowledge Base or PubMed peer-reviewed research whenever possible. When no Knowledge Base or PubMed context is found, Devy draws on GPT-4o's extensive clinical training and makes this distinction transparent to the user."
            legal="Required — PIPEDA Principle 4.6 (Accuracy) and Principle 4.3 (Openness) for health-adjacent information systems"
          />
        </div>
      </div>

      {/* Data privacy note */}
      <div className="bg-white rounded-card-lg shadow-card border border-border/50 p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <Lock size={18} className="text-dblue-500" strokeWidth={2} />
          <h3 className="font-display text-display-sm font-semibold text-ink">Data & Privacy</h3>
        </div>
        <div className="space-y-4 text-body-sm text-ink-secondary leading-relaxed">
          <p>Your conversations and child profile data are stored securely in Canada (Supabase ca-central-1) in compliance with PIPEDA.</p>
          <p>Devy does not share your personal data, conversation content, or child profiles with third parties for advertising or profiling purposes.</p>
          <p>Conversation data may be used in aggregate, anonymised form to improve Devy&apos;s Knowledge Base quality. No personally identifiable information is retained in this process.</p>
        </div>
      </div>

      <div className="bg-sage-50 border border-sage-200 rounded-card-lg px-5 py-4 flex items-start gap-3">
        <ShieldCheck size={18} className="text-sage-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
        <p className="text-body-sm text-sage-800 leading-relaxed">
          <strong>Devy is an informational tool only.</strong> It does not provide medical advice. Responses should always be reviewed by qualified professionals before being acted upon in a clinical context.
        </p>
      </div>
    </div>
  )
}

interface PolicyRowProps {
  title: string
  description: string
  legal: string
}

function PolicyRow({ title, description, legal }: PolicyRowProps) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-border/50 last:border-0">
      {/* Always-on indicator */}
      <div className="flex-shrink-0 mt-0.5">
        <div
          className="w-10 rounded-full relative"
          style={{ height: '22px', backgroundColor: '#5C8651' }}
          aria-label="Always on"
          title="Always on — cannot be disabled"
        >
          <span
            className="absolute top-0.5 right-0.5 w-[18px] h-[18px] rounded-full bg-white shadow-card"
          />
        </div>
      </div>
      <div className="flex-1">
        <p className="text-body-sm font-medium text-ink mb-0.5">{title}</p>
        <p className="text-body-sm text-ink-secondary mb-2">{description}</p>
        <div className="flex items-start gap-1.5">
          <Info size={11} className="text-ink-tertiary flex-shrink-0 mt-0.5" />
          <p className="text-body-xs text-ink-tertiary leading-relaxed">{legal}</p>
        </div>
      </div>
    </div>
  )
}
