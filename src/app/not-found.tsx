import Link from 'next/link'
import { DevyLogo } from '@/components/shared/DevyLogo'
import { NoiseTexture } from '@/components/shared/NoiseTexture'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <NoiseTexture opacity={0.025} />
      <div aria-hidden className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(92,134,81,0.10) 0%, transparent 70%)', filter: 'blur(60px)' }} />

      <div className="relative z-10 text-center max-w-md">
        <div className="flex justify-center mb-10">
          <Link href="/" className="focus-ring rounded-md">
            <DevyLogo size="lg" />
          </Link>
        </div>

        <p className="font-display text-[6rem] font-bold text-sage-200 leading-none select-none">404</p>
        <h1 className="font-display text-display-md font-bold text-ink tracking-tight mt-2 mb-3">
          Page not found
        </h1>
        <p className="text-body-sm text-ink-secondary mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="px-6 py-2.5 bg-sage-500 text-white font-medium text-body-sm rounded-pill shadow-button hover:bg-sage-600 hover:shadow-button-hover active:scale-[0.98] focus-ring"
            style={{ transitionProperty: 'background-color, box-shadow, transform', transitionDuration: '150ms' }}
          >
            Go to dashboard
          </Link>
          <Link
            href="/"
            className="px-6 py-2.5 bg-white text-ink-secondary font-medium text-body-sm rounded-pill border border-border hover:bg-raised hover:text-ink focus-ring"
            style={{ transitionProperty: 'background-color, color', transitionDuration: '150ms' }}
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}
