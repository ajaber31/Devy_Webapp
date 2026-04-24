'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react'
import { useLanguage } from '@/components/shared/LanguageProvider'
import { recordConsent } from '@/lib/actions/consent'

export function ConsentForm() {
  const { t } = useLanguage()
  const c = t.auth.consent
  const [checked, setChecked] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!checked) return
    setError(null)
    startTransition(async () => {
      const result = await recordConsent()
      if (result.error) {
        setError(c.errorRetry)
      } else {
        router.replace('/dashboard')
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto space-y-8">
      <div className="bg-sage-50 border border-sage-200 rounded-2xl p-6 space-y-3">
        <p className="text-body-xs font-semibold text-sage-700 uppercase tracking-widest mb-4">
          {c.commitmentsTitle}
        </p>
        {c.commitments.map((commitment) => (
          <div key={commitment} className="flex items-start gap-3">
            <CheckCircle2
              size={16}
              className="text-sage-500 flex-shrink-0 mt-0.5"
              strokeWidth={2}
            />
            <p className="text-body-sm text-ink-secondary leading-relaxed">{commitment}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <a
          href="/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-body-sm text-dblue-600 hover:text-dblue-700 font-medium focus-ring rounded px-1"
        >
          {c.readPolicy}
          <ExternalLink size={13} strokeWidth={2} />
        </a>
      </div>

      <label className={`
        flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer select-none
        transition-colors duration-150
        ${checked ? 'bg-sage-50 border-sage-400' : 'bg-white border-border hover:border-sage-300'}
      `}>
        <div className="relative flex-shrink-0 mt-0.5">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="sr-only"
          />
          <div className={`
            w-5 h-5 rounded-md border-2 flex items-center justify-center
            transition-all duration-150
            ${checked ? 'bg-sage-500 border-sage-500' : 'bg-white border-border'}
          `}>
            {checked && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        </div>
        <div>
          <p className="text-body-sm font-medium text-ink leading-snug">
            {c.checkboxLabel}{' '}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-dblue-600 hover:underline"
            >
              {c.checkboxPrivacy}
            </a>{' '}
            {c.checkboxAnd}
          </p>
          <p className="text-body-xs text-ink-tertiary mt-1">
            {c.checkboxDisclaimer}
          </p>
        </div>
      </label>

      {error && (
        <p className="text-body-xs text-red-600 text-center">{error}</p>
      )}

      <button
        type="submit"
        disabled={!checked || isPending}
        className={`
          w-full flex items-center justify-center gap-2 py-4 rounded-2xl
          font-body font-semibold text-body-sm
          transition-all duration-200
          ${checked && !isPending
            ? 'bg-sage-500 text-white hover:bg-sage-600 active:scale-[0.99] shadow-button focus-ring'
            : 'bg-surface text-ink-tertiary cursor-not-allowed'
          }
        `}
      >
        {isPending ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            {c.savingConsent}
          </>
        ) : (
          <>
            <Shield size={16} strokeWidth={2} />
            {c.continueToDevy}
          </>
        )}
      </button>

      <p className="text-center text-body-xs text-ink-tertiary pb-4">
        {c.updatePreferences}{' '}
        <span className="font-medium text-ink-secondary">{c.settingsPath}</span>.
      </p>
    </form>
  )
}
