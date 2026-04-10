import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileSidebar } from '@/components/layout/MobileSidebar'
import { PageTransition } from '@/components/shared/PageTransition'
import { getProfile } from '@/lib/actions/profile'
import { initials } from '@/lib/utils'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile()

  if (!profile) {
    redirect('/login')
  }

  const hour = new Date().getHours()
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
  const firstName = profile.name.split(' ')[0]

  const avatarBg: Record<string, string> = {
    parent: 'bg-sage-100 text-sage-700',
    caregiver: 'bg-sage-100 text-sage-700',
    clinician: 'bg-dblue-100 text-dblue-700',
    teacher: 'bg-dblue-100 text-dblue-700',
    admin: 'bg-sand-100 text-sand-600',
    other: 'bg-raised text-ink-secondary',
  }
  const avatarClass = avatarBg[profile.role] ?? avatarBg.other

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

          {/* Desktop: greeting */}
          <p className="hidden lg:block text-body-sm text-ink-secondary">
            Good {timeOfDay},{' '}
            <span className="font-semibold text-ink">{firstName}</span>
          </p>

          {/* Desktop: user identity */}
          <div className="hidden lg:flex items-center gap-2.5">
            <div className="text-right">
              <p className="text-body-xs font-medium text-ink leading-tight">{profile.name}</p>
              <p className="text-[0.65rem] text-ink-tertiary capitalize leading-tight">{profile.role}</p>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-body-xs font-bold flex-shrink-0 ${avatarClass}`}>
              {initials(profile.name)}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  )
}
