import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileSidebar } from '@/components/layout/MobileSidebar'
import { Bell } from 'lucide-react'
import { getProfile } from '@/lib/actions/profile'
import { initials } from '@/lib/utils'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile()

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <div className="hidden lg:flex">
        <Sidebar profile={profile} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 flex items-center justify-between px-4 lg:px-6 border-b border-border bg-canvas flex-shrink-0">
          <div className="lg:hidden">
            <MobileSidebar profile={profile} />
          </div>
          <div className="flex items-center gap-1 text-body-xs font-medium text-ink-tertiary">
            <span className="px-2 py-0.5 bg-sand-100 text-sand-500 rounded-pill">Admin</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              className="p-2 rounded-full text-ink-secondary hover:text-ink hover:bg-raised focus-ring"
              style={{ transitionProperty: 'color, background-color', transitionDuration: '150ms' }}
              aria-label="Notifications"
            >
              <Bell size={18} strokeWidth={1.75} />
            </button>
            <div className="w-8 h-8 rounded-full bg-sage-200 text-sage-800 flex items-center justify-center text-body-xs font-semibold ml-1">
              {initials(profile.name)}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
