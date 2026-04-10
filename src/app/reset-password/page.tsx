'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import { DevyLogo } from '@/components/shared/DevyLogo'
import { NoiseTexture } from '@/components/shared/NoiseTexture'
import { updatePassword } from '@/lib/actions/auth'
import { createBrowserClient } from '@supabase/ssr'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  // Supabase sets the session from the magic link hash on the client.
  // Wait for the session before allowing form submission.
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSessionReady(true)
      } else {
        router.replace('/login')
      }
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setIsPending(true)
    const result = await updatePassword(password)
    setIsPending(false)

    if (result.error) {
      setError(result.error)
    } else {
      router.push('/dashboard')
    }
  }

  if (!sessionReady) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <span key={i} className="w-2 h-2 rounded-full bg-ink-tertiary animate-bounce-dot" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <NoiseTexture opacity={0.025} />

      <div aria-hidden className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(92,134,81,0.12) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div aria-hidden className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(79,115,159,0.10) 0%, transparent 70%)', filter: 'blur(50px)' }} />

      <div className="relative z-10 w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="focus-ring rounded-md">
            <DevyLogo size="lg" />
          </Link>
        </div>

        <div className="bg-white rounded-card-lg shadow-floating border border-border/50 px-8 py-9">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-sage-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={24} className="text-sage-600" strokeWidth={1.75} />
            </div>
            <h1 className="font-display text-display-md font-bold text-ink tracking-tight mb-2">
              Set new password
            </h1>
            <p className="text-body-sm text-ink-secondary">
              Choose a strong password for your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-2.5 px-4 py-3 bg-danger/5 border border-danger/20 rounded-card">
                <AlertCircle size={15} className="text-danger flex-shrink-0 mt-0.5" strokeWidth={2} />
                <p className="text-body-xs text-danger">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-body-sm font-medium text-ink mb-1.5">
                New password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
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

            <div>
              <label htmlFor="confirm" className="block text-body-sm font-medium text-ink mb-1.5">
                Confirm password
              </label>
              <input
                id="confirm"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                className="w-full px-4 py-2.5 bg-surface border border-border rounded-card text-body-sm text-ink placeholder:text-ink-tertiary shadow-input focus:outline-none focus:shadow-input-focus focus:border-sage-400"
                style={{ transitionProperty: 'border-color, box-shadow', transitionDuration: '150ms' }}
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 bg-sage-500 text-white font-medium text-body-base rounded-pill shadow-button hover:bg-sage-600 hover:shadow-button-hover active:scale-[0.99] focus-ring flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ transitionProperty: 'background-color, box-shadow, transform', transitionDuration: '150ms' }}
            >
              {isPending ? 'Updating…' : 'Update password'}
              {!isPending && <ArrowRight size={16} strokeWidth={2.5} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
