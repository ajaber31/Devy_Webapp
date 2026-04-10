import { redirect } from 'next/navigation'
import { ShieldCheck, Leaf } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ConsentForm } from './ConsentForm'
import { CURRENT_CONSENT_VERSION } from '@/lib/types'

export const metadata = {
  title: 'Privacy & Consent — Devy',
  robots: 'noindex',
}

export default async function ConsentPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Must be authenticated to reach this page
  if (!user) redirect('/login')

  // Check if already consented to current version — skip gate if so
  const { data: profile } = await supabase
    .from('profiles')
    .select('consent_version, consent_accepted_at')
    .eq('id', user.id)
    .single()

  const row = profile as Record<string, unknown> | null
  if (row?.consent_version === CURRENT_CONSENT_VERSION && row?.consent_accepted_at != null) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      {/* Subtle background texture */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Top strip */}
      <div className="flex-shrink-0 h-1 bg-gradient-to-r from-sage-400 via-sage-500 to-dblue-500" />

      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-6 py-5 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sage-500 flex items-center justify-center shadow-sm">
            <Leaf size={16} className="text-white" strokeWidth={2} />
          </div>
          <span className="font-display font-bold text-ink text-lg">Devy</span>
        </div>
        <div className="flex items-center gap-1.5 text-body-xs text-ink-tertiary">
          <ShieldCheck size={14} className="text-sage-500" strokeWidth={2} />
          <span>Privacy protected</span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">

          {/* Title block */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-sage-100 text-sage-700 rounded-full px-4 py-1.5 text-body-xs font-semibold mb-5">
              <ShieldCheck size={13} strokeWidth={2.5} />
              Before you begin
            </div>
            <h1 className="font-display text-display-xl font-bold text-ink tracking-tight leading-tight mb-3">
              Your privacy,<br />our responsibility.
            </h1>
            <p className="text-body-md text-ink-secondary max-w-sm mx-auto leading-relaxed">
              Devy may be used alongside sensitive information about children. We want you to clearly understand how your data is handled before you proceed.
            </p>
          </div>

          <ConsentForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="flex-shrink-0 py-5 px-6 border-t border-border/60 text-center">
        <p className="text-body-xs text-ink-tertiary">
          Devy operates under{' '}
          <span className="font-medium text-ink-secondary">PIPEDA</span>{' '}
          (federal) and is designed with{' '}
          <span className="font-medium text-ink-secondary">PHIPA</span>{' '}
          (Ontario) in mind. Data is stored in Canada.
          {' '}Policy version: <span className="font-mono">{CURRENT_CONSENT_VERSION}</span>.
        </p>
      </footer>
    </div>
  )
}
