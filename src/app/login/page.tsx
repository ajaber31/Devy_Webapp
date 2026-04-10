'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react'
import { DevyLogo } from '@/components/shared/DevyLogo'
import { NoiseTexture } from '@/components/shared/NoiseTexture'
import { signIn } from '@/lib/actions/auth'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsPending(true)
    const result = await signIn({ email, password })
    if (result?.error) {
      setError(result.error)
      setIsPending(false)
    } else {
      // Full page navigation ensures the server reads the fresh session
      // cookies set by the signIn server action. router.push() can race
      // with cookie propagation; window.location is reliable.
      window.location.href = '/dashboard'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <NoiseTexture opacity={0.025} />

      {/* Blobs */}
      <div aria-hidden className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(92,134,81,0.12) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div aria-hidden className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(79,115,159,0.10) 0%, transparent 70%)', filter: 'blur(50px)' }} />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="focus-ring rounded-md">
            <DevyLogo size="lg" />
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-card-lg shadow-floating border border-border/50 px-8 py-9">
          <div className="text-center mb-8">
            <h1 className="font-display text-display-md font-bold text-ink tracking-tight mb-2">Welcome back</h1>
            <p className="text-body-sm text-ink-secondary">Sign in to continue to Devy</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-2.5 px-4 py-3 bg-danger/5 border border-danger/20 rounded-card">
                <AlertCircle size={15} className="text-danger flex-shrink-0 mt-0.5" strokeWidth={2} />
                <p className="text-body-xs text-danger">{error}</p>
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-body-sm font-medium text-ink mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 bg-surface border border-border rounded-card text-body-sm text-ink placeholder:text-ink-tertiary shadow-input focus:outline-none focus:shadow-input-focus focus:border-sage-400"
                style={{ transitionProperty: 'border-color, box-shadow', transitionDuration: '150ms' }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-body-sm font-medium text-ink">
                  Password
                </label>
                <Link href="/forgot-password" className="text-body-xs text-sage-600 hover:text-sage-700 transition-colors duration-150">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 pr-10 bg-surface border border-border rounded-card text-body-sm text-ink placeholder:text-ink-tertiary shadow-input focus:outline-none focus:shadow-input-focus focus:border-sage-400"
                  style={{ transitionProperty: 'border-color, box-shadow', transitionDuration: '150ms' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-tertiary hover:text-ink-secondary transition-colors duration-150 focus-ring rounded"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                role="checkbox"
                aria-checked={remember}
                onClick={() => setRemember(!remember)}
                className={`w-4 h-4 rounded flex-shrink-0 border flex items-center justify-center transition-colors duration-150 focus-ring ${
                  remember ? 'bg-sage-500 border-sage-500' : 'bg-white border-border hover:border-sage-400'
                }`}
              >
                {remember && (
                  <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                    <path d="M1.5 5.5L4 8L8.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
              <span className="text-body-sm text-ink-secondary">Remember me for 30 days</span>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 bg-sage-500 text-white font-medium text-body-base rounded-pill shadow-button hover:bg-sage-600 hover:shadow-button-hover active:scale-[0.99] focus-ring flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ transitionProperty: 'background-color, box-shadow, transform', transitionDuration: '150ms' }}
            >
              {isPending ? 'Signing in…' : 'Sign in'}
              {!isPending && <ArrowRight size={16} strokeWidth={2.5} />}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-body-xs text-ink-tertiary">or continue with</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Social placeholders */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Google', icon: 'G' },
              { label: 'Microsoft', icon: 'M' },
            ].map((provider) => (
              <button
                key={provider.label}
                type="button"
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-card text-body-sm font-medium text-ink-secondary hover:bg-raised hover:text-ink focus-ring"
                style={{ transitionProperty: 'background-color, color', transitionDuration: '150ms' }}
              >
                <span className="w-4 h-4 rounded text-xs flex items-center justify-center font-bold bg-raised text-ink">
                  {provider.icon}
                </span>
                {provider.label}
              </button>
            ))}
          </div>

          <p className="text-center text-body-sm text-ink-secondary mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-sage-600 hover:text-sage-700 font-medium transition-colors duration-150">
              Sign up free
            </Link>
          </p>
        </div>

        <p className="text-center text-body-xs text-ink-tertiary mt-6 px-4">
          Devy is an informational tool. It does not provide medical advice.
        </p>
      </div>
    </div>
  )
}
