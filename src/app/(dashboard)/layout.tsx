import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileSidebar } from '@/components/layout/MobileSidebar'
import { Search } from 'lucide-react'
import { getProfile } from '@/lib/actions/profile'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile()

  if (!profile) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar profile={profile} />
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 flex items-center justify-between px-4 lg:px-6 border-b border-border bg-canvas flex-shrink-0">
          {/* Mobile: hamburger */}
          <div className="lg:hidden">
            <MobileSidebar profile={profile} />
          </div>

          {/* Search (desktop only) */}
          <div className="hidden lg:flex items-center gap-2 flex-1 max-w-sm">
            <div className="relative w-full">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
              <input
                type="search"
                placeholder="Search conversations…"
                className="w-full pl-9 pr-4 py-1.5 bg-surface border border-border rounded-pill text-body-sm placeholder:text-ink-tertiary focus:outline-none focus:border-sage-400 focus:shadow-input-focus"
                style={{ transitionProperty: 'border-color, box-shadow', transitionDuration: '150ms' }}
              />
            </div>
          </div>

        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
