'use client'

import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { useLanguage } from '@/components/shared/LanguageProvider'

export function PrivacyNotice() {
  const { t } = useLanguage()
  const tp = t.privacy

  return (
    <div className="bg-white rounded-card-lg shadow-card border border-border/50 overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-2">
        <ShieldCheck size={16} className="text-sage-500 flex-shrink-0" strokeWidth={2} />
        <h3 className="font-display text-[1.05rem] font-semibold text-ink">{tp.title}</h3>
      </div>
      <div className="px-5 py-4 space-y-3">
        <p className="text-body-xs text-ink-secondary leading-relaxed">
          <strong className="text-ink font-medium">{tp.infoTool}</strong> {tp.noMedical}
        </p>
        <p className="text-body-xs text-ink-secondary leading-relaxed">
          {tp.dataStored}
        </p>
        <div className="pt-1 flex flex-col gap-1.5">
          <div className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-sage-400 flex-shrink-0 mt-1.5" />
            <p className="text-body-xs text-ink-secondary">{tp.dataRights}</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-sage-400 flex-shrink-0 mt-1.5" />
            <p className="text-body-xs text-ink-secondary">{tp.noSell}</p>
          </div>
        </div>
        <Link
          href="/settings"
          className="inline-block mt-1 text-body-xs text-sage-600 hover:text-sage-700 font-medium transition-colors duration-150 focus-ring rounded"
        >
          {tp.manageData}
        </Link>
      </div>
    </div>
  )
}
