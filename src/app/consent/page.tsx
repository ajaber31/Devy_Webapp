import { redirect } from 'next/navigation'
import { ShieldCheck, Brain } from 'lucide-react'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ConsentForm } from './ConsentForm'
import { CURRENT_CONSENT_VERSION } from '@/lib/types'
import { getLang } from '@/lib/i18n/server'
import { getT } from '@/lib/i18n'

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang()
  const t = getT(lang)
  return {
    title: t.meta.consent.title,
    description: t.meta.consent.description,
    robots: 'noindex',
  }
}

export default async function ConsentPage() {
  const supabase = createClient()
  const [{ data: { user } }, lang] = await Promise.all([
    supabase.auth.getUser(),
    getLang(),
  ])

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('consent_version, consent_accepted_at')
    .eq('id', user.id)
    .single()

  const row = profile as Record<string, unknown> | null
  if (row?.consent_version === CURRENT_CONSENT_VERSION && row?.consent_accepted_at != null) {
    redirect('/dashboard')
  }

  const t = getT(lang)
  const c = t.auth.consent

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="flex-shrink-0 h-1 bg-gradient-to-r from-sage-400 via-sage-500 to-dblue-500" />

      <header className="flex-shrink-0 flex items-center justify-between px-6 py-5 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sage-500 flex items-center justify-center shadow-sm">
            <Brain size={16} className="text-white" strokeWidth={2} />
          </div>
          <span className="font-display font-bold text-ink text-lg">{c.headerBrand}</span>
        </div>
        <div className="flex items-center gap-1.5 text-body-xs text-ink-tertiary">
          <ShieldCheck size={14} className="text-sage-500" strokeWidth={2} />
          <span>{c.badgePrivacy}</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-sage-100 text-sage-700 rounded-full px-4 py-1.5 text-body-xs font-semibold mb-5">
              <ShieldCheck size={13} strokeWidth={2.5} />
              {c.title}
            </div>
            <h1 className="font-display text-display-xl font-bold text-ink tracking-tight leading-tight mb-3">
              {c.subtitle}
            </h1>
            <p className="text-body-md text-ink-secondary max-w-sm mx-auto leading-relaxed">
              {c.intro}
            </p>
          </div>

          <ConsentForm />
        </div>
      </main>

      <footer className="flex-shrink-0 py-5 px-6 border-t border-border/60 text-center">
        <p className="text-body-xs text-ink-tertiary">
          {c.footerOperates}{' '}
          <span className="font-medium text-ink-secondary">{c.piplaLabel}</span>{' '}
          {c.footerFederal}{' '}
          <span className="font-medium text-ink-secondary">{c.phpiaLabel}</span>{' '}
          {c.footerOntario}
          {' '}{c.policyVersion} <span className="font-mono">{CURRENT_CONSENT_VERSION}</span>.
        </p>
      </footer>
    </div>
  )
}
