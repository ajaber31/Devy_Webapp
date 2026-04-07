import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'

export function PrivacyNotice() {
  return (
    <div className="bg-white rounded-card-lg shadow-card border border-border/50 overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-2">
        <ShieldCheck size={16} className="text-sage-500 flex-shrink-0" strokeWidth={2} />
        <h3 className="font-display text-[1.05rem] font-semibold text-ink">Privacy &amp; Data</h3>
      </div>
      <div className="px-5 py-4 space-y-3">
        <p className="text-body-xs text-ink-secondary leading-relaxed">
          Devy is an <strong className="text-ink font-medium">informational tool only</strong>. It does not provide medical advice, clinical assessments, or diagnoses.
        </p>
        <p className="text-body-xs text-ink-secondary leading-relaxed">
          Your data is stored securely in <strong className="text-ink font-medium">Canada</strong> in accordance with{' '}
          <strong className="text-ink font-medium">PIPEDA</strong> and{' '}
          <strong className="text-ink font-medium">PHIPA</strong>. Child profiles contain only information you choose to share — no health records are stored.
        </p>
        <div className="pt-1 flex flex-col gap-1.5">
          <div className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-sage-400 flex-shrink-0 mt-1.5" />
            <p className="text-body-xs text-ink-secondary">You may request a copy or deletion of your data at any time</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-sage-400 flex-shrink-0 mt-1.5" />
            <p className="text-body-xs text-ink-secondary">Devy does not sell or share your data with third parties</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-sage-400 flex-shrink-0 mt-1.5" />
            <p className="text-body-xs text-ink-secondary">Always consult a qualified professional for medical or clinical guidance</p>
          </div>
        </div>
        <Link
          href="/settings"
          className="inline-block mt-1 text-body-xs text-sage-600 hover:text-sage-700 font-medium transition-colors duration-150 focus-ring rounded"
        >
          Manage your data in Settings →
        </Link>
      </div>
    </div>
  )
}
