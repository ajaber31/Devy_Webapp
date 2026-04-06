'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, LogOut } from 'lucide-react'
import { DevyLogo } from '@/components/shared/DevyLogo'
import { mockCurrentUser } from '@/lib/mock-data/users'
import { ADMIN_NAV_ITEMS } from '@/lib/constants'
import { cn, initials } from '@/lib/utils'

export function MobileSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

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
          'transition-transform duration-300',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
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
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
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
              {initials(mockCurrentUser.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-body-sm font-medium text-ink truncate">{mockCurrentUser.name}</p>
              <p className="text-body-xs text-ink-tertiary truncate">{mockCurrentUser.email}</p>
            </div>
          </div>
          <Link
            href="/login"
            className="flex items-center gap-2 px-3 py-2 mt-1 text-body-sm text-danger hover:bg-raised rounded-card transition-colors duration-150"
          >
            <LogOut size={14} />
            Sign out
          </Link>
        </div>
      </div>
    </>
  )
}
