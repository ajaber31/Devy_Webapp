import Link from 'next/link'
import { ArrowRight, Users } from 'lucide-react'
import { mockCurrentUser } from '@/lib/mock-data/users'
import { NoiseTexture } from '@/components/shared/NoiseTexture'

export function WelcomeBanner() {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = mockCurrentUser.name.split(' ')[0]

  return (
    <div
      className="relative overflow-hidden rounded-card-lg px-7 py-6 text-white"
      style={{ background: 'linear-gradient(135deg, #385432 0%, #5C8651 50%, #4F739F 100%)' }}
    >
      <NoiseTexture opacity={0.04} />
      <div
        aria-hidden
        className="absolute right-0 top-0 bottom-0 w-64 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at right, rgba(255,255,255,0.08) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-sage-200 text-body-sm font-medium mb-1">{greeting}</p>
          <h2 className="font-display text-display-md font-bold text-white tracking-tight mb-2">
            Welcome back, {firstName}.
          </h2>
          <p className="text-white/75 text-body-sm max-w-sm">
            Devy&apos;s knowledge base is ready. Ask a question or open a child profile to get started.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/children"
            className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white font-medium text-body-sm rounded-pill hover:bg-white/30 border border-white/30 active:scale-[0.98]"
            style={{ transitionProperty: 'background-color, transform', transitionDuration: '150ms' }}
          >
            <Users size={14} strokeWidth={2} />
            My Children
          </Link>
          <Link
            href="/chat"
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-sage-700 font-semibold text-body-sm rounded-pill shadow-floating hover:bg-sage-50 active:scale-[0.98]"
            style={{ transitionProperty: 'background-color, transform', transitionDuration: '150ms' }}
          >
            New chat
            <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </div>
  )
}
