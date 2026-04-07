'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { DevyLogo } from '@/components/shared/DevyLogo'
import { ADMIN_NAV_ITEMS, DASHBOARD_NAV_ITEMS } from '@/lib/constants'
import { cn, initials } from '@/lib/utils'
import { signOut } from '@/lib/actions/auth'
import type { LucideIcon } from 'lucide-react'
import type { Profile } from '@/lib/types'

interface NavItemProps {
  href: string
  label: string
  icon: LucideIcon
  active: boolean
  collapsed: boolean
}

function NavItem({ href, label, icon: Icon, active, collapsed }: NavItemProps) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-card text-body-sm font-medium group',
        'focus-ring',
        collapsed ? 'justify-center' : '',
        active
          ? 'bg-sage-100 text-sage-700 shadow-card'
          : 'text-ink-secondary hover:bg-raised hover:text-ink'
      )}
      style={{ transitionProperty: 'background-color, color', transitionDuration: '150ms' }}
    >
      <Icon
        size={18}
        strokeWidth={active ? 2 : 1.75}
        className={cn('flex-shrink-0', active ? 'text-sage-600' : 'text-ink-tertiary group-hover:text-ink-secondary')}
        style={{ transitionProperty: 'color', transitionDuration: '150ms' }}
      />
      {!collapsed && <span>{label}</span>}
    </Link>
  )
}

interface SidebarProps {
  profile: Profile
}

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const navItems = profile.role === 'admin' ? ADMIN_NAV_ITEMS : DASHBOARD_NAV_ITEMS

  return (
    <aside
      className={cn(
        'flex flex-col h-screen border-r border-border bg-gradient-sidebar flex-shrink-0',
        collapsed ? 'w-16' : 'w-72'
      )}
      style={{ transitionProperty: 'width', transitionDuration: '200ms', transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
    >
      {/* Logo area */}
      <div className={cn('flex items-center border-b border-border h-16 px-4 flex-shrink-0', collapsed ? 'justify-center' : 'justify-between')}>
        <Link href="/dashboard" className="focus-ring rounded-md flex-shrink-0">
          <DevyLogo size="sm" variant={collapsed ? 'mark' : 'full'} />
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn('p-1.5 rounded-md text-ink-tertiary hover:text-ink hover:bg-raised focus-ring', collapsed ? 'hidden' : '')}
          style={{ transitionProperty: 'color, background-color', transitionDuration: '150ms' }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {/* Collapse toggle when collapsed */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="mx-auto mt-2 p-1.5 rounded-md text-ink-tertiary hover:text-ink hover:bg-raised focus-ring"
          style={{ transitionProperty: 'color, background-color', transitionDuration: '150ms' }}
          aria-label="Expand sidebar"
        >
          <PanelLeftOpen size={16} />
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto" aria-label="App navigation">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* User row */}
      <div className="border-t border-border p-3 relative">
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className={cn(
            'w-full flex items-center gap-3 p-2 rounded-card hover:bg-raised focus-ring group',
            collapsed ? 'justify-center' : ''
          )}
          style={{ transitionProperty: 'background-color', transitionDuration: '150ms' }}
        >
          <div className="w-8 h-8 rounded-full bg-sage-200 text-sage-800 flex items-center justify-center text-body-xs font-semibold flex-shrink-0">
            {initials(profile.name)}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-body-sm font-medium text-ink truncate">{profile.name}</p>
                <p className="text-body-xs text-ink-tertiary truncate capitalize">{profile.role}</p>
              </div>
              <ChevronDown
                size={14}
                className={cn('text-ink-tertiary flex-shrink-0', userMenuOpen ? 'rotate-180' : '')}
                style={{ transitionProperty: 'transform', transitionDuration: '150ms' }}
              />
            </>
          )}
        </button>

        {/* User dropdown */}
        {userMenuOpen && !collapsed && (
          <div className="absolute bottom-full left-2 right-2 mb-1 bg-white rounded-card shadow-floating border border-border py-1 z-20">
            <div className="px-3 py-2 border-b border-border mb-1">
              <p className="text-body-xs font-medium text-ink">{profile.name}</p>
              <p className="text-body-xs text-ink-tertiary">{profile.email}</p>
            </div>
            <Link
              href="/settings"
              onClick={() => setUserMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-body-sm text-ink-secondary hover:bg-raised hover:text-ink"
              style={{ transitionProperty: 'background-color, color', transitionDuration: '150ms' }}
            >
              Account settings
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="w-full flex items-center gap-2 px-3 py-2 text-body-sm text-danger hover:bg-raised"
                style={{ transitionProperty: 'background-color', transitionDuration: '150ms' }}
              >
                <LogOut size={14} />
                Sign out
              </button>
            </form>
          </div>
        )}
      </div>
    </aside>
  )
}
