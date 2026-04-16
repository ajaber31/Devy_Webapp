import Link from 'next/link'
import { DevyLogo } from '@/components/shared/DevyLogo'
import { getT } from '@/lib/i18n'
import type { Lang } from '@/lib/i18n'

export function Footer({ lang = 'en' }: { lang?: Lang }) {
  const t = getT(lang).landing.footer

  const footerLinks = {
    [t.product]: [
      { label: getT(lang).nav.howItWorks,  href: '/#how-it-works' },
      { label: getT(lang).nav.whoItsFor,   href: '/#who-its-for' },
      { label: getT(lang).nav.trustSafety, href: '/#trust' },
      { label: getT(lang).nav.getStarted,  href: '/signup' },
    ],
    [t.legal]: [
      { label: 'Privacy Policy',   href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Refund Policy',    href: '/refund' },
    ],
  }

  return (
    <footer className="bg-surface border-t border-border">
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <DevyLogo size="md" className="mb-4" />
            <p className="text-body-sm text-ink-secondary leading-relaxed max-w-xs">
              {t.tagline}
            </p>
            <div className="mt-6 flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sage-100 text-sage-700 text-body-xs font-medium rounded-pill">
                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none"><path d="M6 1L7.5 4.5H11L8 6.5L9.5 10L6 8L2.5 10L4 6.5L1 4.5H4.5L6 1Z" fill="currentColor"/></svg>
                {t.evidenceBased}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-dblue-100 text-dblue-700 text-body-xs font-medium rounded-pill">
                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none"><rect x="1" y="2" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M4 5.5H8M4 7.5H6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                {t.researchGrounded}
              </span>
            </div>
          </div>

          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-body-xs font-semibold text-ink uppercase tracking-wider mb-4">{section}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-body-sm text-ink-secondary hover:text-ink transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-body-xs text-ink-tertiary">
            © {new Date().getFullYear()} Devy. {t.allRightsReserved}
          </p>
          <p className="text-body-xs text-ink-tertiary">
            {t.disclaimer}
          </p>
        </div>
      </div>
    </footer>
  )
}
