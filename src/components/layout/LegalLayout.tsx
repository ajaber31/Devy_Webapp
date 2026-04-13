import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

interface TocItem {
  id: string
  label: string
}

interface LegalLayoutProps {
  title: string
  subtitle: string
  lastUpdated: string
  toc: TocItem[]
  children: React.ReactNode
}

export function LegalLayout({ title, subtitle, lastUpdated, toc, children }: LegalLayoutProps) {
  return (
    <>
      <Navbar />
      <main className="bg-canvas min-h-screen">
        {/* Hero header */}
        <div className="relative overflow-hidden pt-28 pb-16 border-b border-border">
          {/* Subtle background gradient */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              background:
                'radial-gradient(ellipse 70% 60% at 20% 50%, rgba(92,134,81,0.07) 0%, transparent 60%), radial-gradient(ellipse 50% 80% at 90% 20%, rgba(79,115,159,0.05) 0%, transparent 55%)',
            }}
          />
          <div className="relative max-w-6xl mx-auto px-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-body-xs text-ink-tertiary mb-6" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-ink-secondary transition-colors duration-150">Home</Link>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M4.5 3L7.5 6L4.5 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-ink-secondary">{title}</span>
            </nav>

            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-sage-100 rounded-pill mb-5">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <rect x="1.5" y="1.5" width="9" height="9" rx="1.5" stroke="#5C8651" strokeWidth="1.3"/>
                  <path d="M3.5 4.5H8.5M3.5 6H7M3.5 7.5H6" stroke="#5C8651" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                <span className="text-body-xs font-medium text-sage-700">Legal Document</span>
              </div>
              <h1 className="font-display text-display-lg text-ink mb-3">{title}</h1>
              <p className="text-body-base text-ink-secondary leading-relaxed">{subtitle}</p>
              <p className="mt-4 text-body-xs text-ink-tertiary">
                Last updated: <time>{lastUpdated}</time>
              </p>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="flex gap-16 items-start">

            {/* Sticky TOC — desktop only */}
            <aside className="hidden lg:block w-56 flex-shrink-0 sticky top-24 self-start">
              <p className="text-body-xs font-semibold text-ink uppercase tracking-wider mb-4">Contents</p>
              <nav className="space-y-1" aria-label="Table of contents">
                {toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block text-body-sm text-ink-secondary hover:text-sage-600 py-1.5 border-l-2 border-transparent hover:border-sage-400 pl-3 transition-colors duration-150"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              {/* Legal notice card */}
              <div className="mt-8 p-4 bg-surface rounded-card border border-border">
                <p className="text-body-xs text-ink-secondary leading-relaxed">
                  These documents are templates and do not constitute legal advice. Consult a qualified lawyer before going live.
                </p>
              </div>
            </aside>

            {/* Main prose content */}
            <article className="flex-1 min-w-0 prose-legal">
              {children}
            </article>

          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

/* ── Prose sub-components ────────────────────────────────────────── */

export function LegalSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-12 scroll-mt-28">
      <h2 className="font-display text-display-sm text-ink mb-5 pb-3 border-b border-border flex items-start gap-3">
        <span
          className="flex-shrink-0 mt-0.5 w-7 h-7 rounded-md bg-sage-100 flex items-center justify-center"
          aria-hidden="true"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 4.5H11M3 7H9M3 9.5H7" stroke="#5C8651" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </span>
        {title}
      </h2>
      <div className="text-body-base text-ink-secondary leading-relaxed space-y-4">
        {children}
      </div>
    </section>
  )
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 my-3">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-body-sm text-ink-secondary">
          <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-sage-400" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function LegalCallout({ icon, children }: { icon?: string; children: React.ReactNode }) {
  return (
    <div className="my-5 flex gap-4 p-4 bg-dblue-50 border border-dblue-100 rounded-card">
      <span className="flex-shrink-0 text-lg leading-none mt-0.5" aria-hidden="true">{icon ?? 'ℹ️'}</span>
      <p className="text-body-sm text-dblue-700 leading-relaxed">{children}</p>
    </div>
  )
}

export function LegalWarning({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-5 flex gap-4 p-4 bg-sand-100 border border-sand-200 rounded-card">
      <span className="flex-shrink-0 text-lg leading-none mt-0.5" aria-hidden="true">⚠️</span>
      <p className="text-body-sm text-ink-secondary leading-relaxed">{children}</p>
    </div>
  )
}

export function LegalContact() {
  return (
    <div className="mt-6 p-5 bg-surface rounded-card border border-border">
      <p className="text-body-sm font-medium text-ink mb-1">Contact Us</p>
      <p className="text-body-sm text-ink-secondary">
        For questions about this document, email us at{' '}
        <a href="mailto:privacy@devy.app" className="text-sage-600 hover:text-sage-700 underline underline-offset-2 transition-colors duration-150">
          privacy@devy.app
        </a>
      </p>
    </div>
  )
}
