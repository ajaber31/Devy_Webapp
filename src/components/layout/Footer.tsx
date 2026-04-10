import Link from 'next/link'
import { DevyLogo } from '@/components/shared/DevyLogo'

const footerLinks = {
  Product: [
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Who It\'s For', href: '/#who-its-for' },
    { label: 'Trust & Safety', href: '/#trust' },
    { label: 'Get Started', href: '/signup' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#', comingSoon: true },
    { label: 'Terms of Service', href: '#', comingSoon: true },
    { label: 'PIPEDA Notice', href: '#', comingSoon: true },
  ],
}

export function Footer() {
  return (
    <footer className="bg-surface border-t border-border">
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <DevyLogo size="md" className="mb-4" />
            <p className="text-body-sm text-ink-secondary leading-relaxed max-w-xs">
              Trusted, source-grounded support for the families, caregivers, and clinicians who show up every day for children with special needs.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sage-100 text-sage-700 text-body-xs font-medium rounded-pill">
                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none"><path d="M6 1L7.5 4.5H11L8 6.5L9.5 10L6 8L2.5 10L4 6.5L1 4.5H4.5L6 1Z" fill="currentColor"/></svg>
                Evidence-based
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-dblue-100 text-dblue-700 text-body-xs font-medium rounded-pill">
                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none"><rect x="1" y="2" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M4 5.5H8M4 7.5H6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                Research-grounded
              </span>
            </div>
          </div>

          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-body-xs font-semibold text-ink uppercase tracking-wider mb-4">{section}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    {'comingSoon' in link && link.comingSoon ? (
                      <span className="flex items-center gap-2 text-body-sm text-ink-tertiary cursor-default select-none">
                        {link.label}
                        <span className="text-[0.6rem] font-medium px-1.5 py-0.5 bg-raised rounded border border-border text-ink-tertiary uppercase tracking-wide">Soon</span>
                      </span>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-body-sm text-ink-secondary hover:text-ink transition-colors duration-150"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-body-xs text-ink-tertiary">
            © {new Date().getFullYear()} Devy. All rights reserved.
          </p>
          <p className="text-body-xs text-ink-tertiary">
            Devy is an informational tool and does not provide medical advice.
          </p>
        </div>
      </div>
    </footer>
  )
}
