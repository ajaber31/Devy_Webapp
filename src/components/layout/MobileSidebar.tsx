'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, LogOut } from 'lucide-react'
import { DevyLogo } from '@/components/shared/DevyLogo'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { useLanguage } from '@/components/shared/LanguageProvider'
import { ADMIN_NAV_ITEMS, DASHBOARD_NAV_ITEMS } from '@/lib/constants'
import { cn, initials } from '@/lib/utils'
import { signOut } from '@/lib/actions/auth'
import { getRoleTerminology } from '@/lib/role-terminology'
import type { Profile } from '@/lib/types'

interface MobileSidebarProps {
  profile: Profile
}

export function MobileSidebar({ profile }: MobileSidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { t } = useLanguage()
  const rawNavItems = profile.role === 'admin' ? ADMIN_NAV_ITEMS : DASHBOARD_NAV_ITEMS
  const terms = getRoleTerminology(profile.role)
  const navItems = rawNavItems.map(item =>
    item.href === '/children' ? { ...item, label: terms.nounPlural } : item
  )

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-md text-ink-secondary hover:text-ink hover:bg-raised focus-ring"
        style={{ transitionProperty: 'color, background-color', transitionDuration: '150ms' }}
        aria-label="Open navigation menu"
      >
        <Menu size={20} />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-ink/30 z-40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'fixed top-0 left-0 bottom-0 w-72 bg-canvas z-50 shadow-floating flex flex-col',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ transitionProperty: 'transform', transitionDuration: '300ms', transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
      >
        <div className="flex items-center justify-between px-4 h-16 border-b border-border flex-shrink-0">
          <DevyLogo size="sm" />
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-md text-ink-tertiary hover:text-ink hover:bg-raised focus-ring"
            style={{ transitionProperty: 'color, background-color', transitionDuration: '150ms' }}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-card text-body-sm font-medium',
                  active
                    ? 'bg-sage-100 text-sage-700'
                    : 'text-ink-secondary hover:bg-raised hover:text-ink'
                )}
                style={{ transitionProperty: 'background-color, color', transitionDuration: '150ms' }}
              >
                <Icon size={18} strokeWidth={active ? 2 : 1.75} className="flex-shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 p-2">
            <div className="w-8 h-8 rounded-full bg-sage-200 text-sage-800 flex items-center justify-center text-body-xs font-semibold flex-shrink-0">
              {initials(profile.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-body-sm font-medium text-ink truncate">{profile.name}</p>
              <p className="text-body-xs text-ink-tertiary truncate">{profile.email}</p>
            </div>
          </div>
          <div className="px-2 py-2 flex items-center justify-between">
            <span className="text-body-xs text-ink-tertiary">{t.settings.language}</span>
            <LanguageSwitcher variant="pill" />
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2 mt-1 text-body-sm text-danger hover:bg-raised rounded-card"
              style={{ transitionProperty: 'background-color', transitionDuration: '150ms' }}
            >
              <LogOut size={14} />
              {t.nav.signOut}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
