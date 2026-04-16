'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { DevyLogo } from '@/components/shared/DevyLogo'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { useLanguage } from '@/components/shared/LanguageProvider'
import { cn } from '@/lib/utils'
import type { Lang } from '@/lib/i18n'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Navbar({ lang: _lang }: { lang?: Lang }) {
  const { t } = useLanguage()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const navLinks = [
    { label: t.nav.howItWorks,  href: '#how-it-works' },
    { label: t.nav.whoItsFor,   href: '#who-its-for' },
    { label: t.nav.trustSafety, href: '#trust' },
  ]

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-colors duration-300',
        scrolled
          ? 'bg-canvas/95 backdrop-blur-md shadow-elevated border-b border-border'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex-shrink-0 focus-ring rounded-md">
          <DevyLogo size="md" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-body-sm font-medium text-ink-secondary hover:text-ink transition-colors duration-150 focus-ring rounded-sm"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher variant="pill" />
          <Link
            href="/login"
            className="px-4 py-2 text-body-sm font-medium text-ink-secondary hover:text-ink transition-colors duration-150 focus-ring rounded-md"
          >
            {t.nav.logIn}
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2 text-body-sm font-medium bg-sage-500 text-white rounded-pill shadow-button hover:bg-sage-600 hover:shadow-button-hover active:scale-[0.98] transition-colors duration-150 focus-ring"
            style={{ transitionProperty: 'background-color, box-shadow' }}
          >
            {t.nav.getStarted}
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-2">
          <LanguageSwitcher variant="minimal" />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-md text-ink-secondary hover:text-ink hover:bg-raised transition-colors duration-150 focus-ring"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-canvas border-t border-border px-6 py-4 flex flex-col gap-3">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-body-base text-ink-secondary hover:text-ink py-2 transition-colors duration-150"
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-border">
            <Link href="/login" className="text-center py-2.5 text-body-sm font-medium text-ink-secondary border border-border rounded-card hover:bg-raised transition-colors duration-150">
              {t.nav.logIn}
            </Link>
            <Link href="/signup" className="text-center py-2.5 text-body-sm font-medium bg-sage-500 text-white rounded-pill shadow-button hover:bg-sage-600 transition-colors duration-150">
              {t.nav.getStarted}
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
