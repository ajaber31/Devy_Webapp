'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, AlertCircle, MailCheck } from 'lucide-react'
import { DevyLogo } from '@/components/shared/DevyLogo'
import { NoiseTexture } from '@/components/shared/NoiseTexture'
import { forgotPassword } from '@/lib/actions/auth'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsPending(true)
    const result = await forgotPassword(email)
    setIsPending(false)
    if (result.error) {
      setError(result.error)
    } else {
      setSent(true)
    }
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
          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-sage-100 flex items-center justify-center mx-auto mb-5">
                <MailCheck size={24} className="text-sage-600" strokeWidth={1.75} />
              </div>
              <h1 className="font-display text-display-md font-bold text-ink tracking-tight mb-2">
                Check your email
              </h1>
              <p className="text-body-sm text-ink-secondary mb-6 leading-relaxed">
                We&apos;ve sent a password reset link to <span className="font-medium text-ink">{email}</span>.
                It may take a minute to arrive.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-body-sm text-sage-600 hover:text-sage-700 font-medium transition-colors duration-150"
              >
                <ArrowLeft size={15} strokeWidth={2} />
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="font-display text-display-md font-bold text-ink tracking-tight mb-2">
                  Reset your password
                </h1>
                <p className="text-body-sm text-ink-secondary">
                  Enter your email and we&apos;ll send you a reset link.
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

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-3 bg-sage-500 text-white font-medium text-body-base rounded-pill shadow-button hover:bg-sage-600 hover:shadow-button-hover active:scale-[0.99] focus-ring flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ transitionProperty: 'background-color, box-shadow, transform', transitionDuration: '150ms' }}
                >
                  {isPending ? 'Sending…' : 'Send reset link'}
                  {!isPending && <ArrowRight size={16} strokeWidth={2.5} />}
                </button>
              </form>

              <p className="text-center text-body-sm text-ink-secondary mt-6">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sage-600 hover:text-sage-700 font-medium transition-colors duration-150"
                >
                  <ArrowLeft size={14} strokeWidth={2} />
                  Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
