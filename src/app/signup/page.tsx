'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, ArrowRight, Check, AlertCircle, MailCheck, Zap, Crown, Stethoscope } from 'lucide-react'
import { DevyLogo } from '@/components/shared/DevyLogo'
import { NoiseTexture } from '@/components/shared/NoiseTexture'
import { ACCOUNT_TYPE_OPTIONS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { signUp } from '@/lib/actions/auth'
import type { PlanId } from '@/lib/types'

const PLAN_LABELS: Record<string, { name: string; price: string; icon: React.ReactNode }> = {
  starter: {
    name: 'Starter',
    price: '$14 CAD/mo',
    icon: <Zap size={13} className="text-dblue-500" strokeWidth={2} />,
  },
  pro: {
    name: 'Pro',
    price: '$24 CAD/mo',
    icon: <Crown size={13} className="text-sage-600" strokeWidth={2} />,
  },
  clinician: {
    name: 'Clinician',
    price: '$39 CAD/mo',
    icon: <Stethoscope size={13} className="text-sand-600" strokeWidth={2} />,
  },
}

function SignupPageInner() {
  const searchParams = useSearchParams()
  const planParam = searchParams.get('plan') as PlanId | null
  const selectedPlan = planParam && planParam in PLAN_LABELS ? planParam : null

  const [showPassword, setShowPassword] = useState(false)
  const [accountType, setAccountType] = useState<string>('')
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    if (!accountType) {
      setError('Please select an account type.')
      return
    }

    setIsPending(true)

    // Store intended plan so dashboard can prompt checkout after email confirmation
    if (selectedPlan) {
      try { localStorage.setItem('devy_pending_plan', selectedPlan) } catch { /* ignore */ }
    }

    const result = await signUp({
      name: form.name,
      email: form.email,
      password: form.password,
      accountType,
    })

    if (result?.error) {
      setError(result.error)
      setIsPending(false)
    } else if (result?.success) {
      setSuccessMessage(result.message ?? 'Account created! Check your email.')
    }
  }

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm(prev => ({ ...prev, [key]: e.target.value })),
  })

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden">
      <NoiseTexture opacity={0.025} />

      <div aria-hidden className="absolute top-20 left-1/3 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(92,134,81,0.10) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div aria-hidden className="absolute bottom-20 right-1/4 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(79,115,159,0.09) 0%, transparent 70%)', filter: 'blur(50px)' }} />

      <div className="relative z-10 w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="focus-ring rounded-md">
            <DevyLogo size="lg" />
          </Link>
        </div>

        <div className="bg-white rounded-card-lg shadow-floating border border-border/50 px-8 py-9">
          <div className="text-center mb-8">
            <h1 className="font-display text-display-md font-bold text-ink tracking-tight mb-2">Create your account</h1>
            <p className="text-body-sm text-ink-secondary">Start getting grounded, trusted support today.</p>
          </div>

          {/* Plan context banner — shown when coming from pricing page */}
          {selectedPlan && PLAN_LABELS[selectedPlan] && (
            <div className="flex items-center gap-3 px-4 py-3 bg-sage-50 border border-sage-200 rounded-card mb-5">
              <div className="w-7 h-7 rounded-full bg-white border border-sage-200 flex items-center justify-center shrink-0">
                {PLAN_LABELS[selectedPlan].icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-body-xs font-semibold text-sage-800">
                  {PLAN_LABELS[selectedPlan].name} plan · {PLAN_LABELS[selectedPlan].price}
                </p>
                <p className="text-body-xs text-sage-600">
                  Create your account, then complete your upgrade from the dashboard.
                </p>
              </div>
            </div>
          )}

          {successMessage ? (
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="w-14 h-14 rounded-full bg-sage-100 flex items-center justify-center">
                <MailCheck size={26} className="text-sage-600" strokeWidth={1.75} />
              </div>
              <div>
                <h2 className="font-display text-display-sm font-semibold text-ink mb-1.5">Check your email</h2>
                <p className="text-body-sm text-ink-secondary">{successMessage}</p>
                {selectedPlan && PLAN_LABELS[selectedPlan] && (
                  <p className="text-body-xs text-ink-tertiary mt-2">
                    After confirming your email and signing in, you&apos;ll be prompted to complete your {PLAN_LABELS[selectedPlan].name} upgrade.
                  </p>
                )}
              </div>
              <Link
                href="/login"
                className="mt-2 px-6 py-2.5 bg-sage-500 text-white font-medium text-body-sm rounded-pill shadow-button hover:bg-sage-600 focus-ring"
                style={{ transitionProperty: 'background-color', transitionDuration: '150ms' }}
              >
                Go to sign in
              </Link>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-2.5 px-4 py-3 bg-danger/5 border border-danger/20 rounded-card">
                <AlertCircle size={15} className="text-danger flex-shrink-0 mt-0.5" strokeWidth={2} />
                <p className="text-body-xs text-danger">{error}</p>
              </div>
            )}
            {/* Full name */}
            <div>
              <label htmlFor="name" className="block text-body-sm font-medium text-ink mb-1.5">Full name</label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                {...field('name')}
                placeholder="Your full name"
                className="w-full px-4 py-2.5 bg-surface border border-border rounded-card text-body-sm text-ink placeholder:text-ink-tertiary shadow-input focus:outline-none focus:shadow-input-focus focus:border-sage-400"
                style={{ transitionProperty: 'border-color, box-shadow', transitionDuration: '150ms' }}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="signup-email" className="block text-body-sm font-medium text-ink mb-1.5">Email address</label>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                required
                {...field('email')}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 bg-surface border border-border rounded-card text-body-sm text-ink placeholder:text-ink-tertiary shadow-input focus:outline-none focus:shadow-input-focus focus:border-sage-400"
                style={{ transitionProperty: 'border-color, box-shadow', transitionDuration: '150ms' }}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="signup-password" className="block text-body-sm font-medium text-ink mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  {...field('password')}
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

            {/* Confirm password */}
            <div>
              <label htmlFor="confirm" className="block text-body-sm font-medium text-ink mb-1.5">Confirm password</label>
              <input
                id="confirm"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                {...field('confirm')}
                placeholder="Repeat your password"
                className="w-full px-4 py-2.5 bg-surface border border-border rounded-card text-body-sm text-ink placeholder:text-ink-tertiary shadow-input focus:outline-none focus:shadow-input-focus focus:border-sage-400"
                style={{ transitionProperty: 'border-color, box-shadow', transitionDuration: '150ms' }}
              />
            </div>

            {/* Account type */}
            <div>
              <p className="text-body-sm font-medium text-ink mb-2.5">I am a…</p>
              <div className="grid grid-cols-2 gap-3">
                {ACCOUNT_TYPE_OPTIONS.map((option) => {
                  const selected = accountType === option.value
                  // "Other" spans full width when it ends up as the last lone item
                  const isOther = option.value === 'other'
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setAccountType(option.value)}
                      className={cn(
                        'relative flex flex-col items-start gap-1.5 p-4 rounded-card border text-left',
                        'focus-ring',
                        isOther ? 'col-span-2' : '',
                        selected
                          ? 'border-sage-400 bg-sage-50 ring-2 ring-sage-300 ring-offset-1'
                          : 'border-border bg-surface hover:bg-raised hover:border-sage-200'
                      )}
                      style={{ transitionProperty: 'background-color, border-color, box-shadow', transitionDuration: '150ms' }}
                    >
                      {selected && (
                        <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-sage-500 flex items-center justify-center">
                          <Check size={12} className="text-white" strokeWidth={2.5} />
                        </div>
                      )}
                      <span className="text-lg leading-none">{option.icon}</span>
                      <span className="text-body-sm font-semibold text-ink">{option.label}</span>
                      <span className="text-body-xs text-ink-tertiary leading-snug">{option.description}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 bg-sage-500 text-white font-medium text-body-base rounded-pill shadow-button hover:bg-sage-600 hover:shadow-button-hover active:scale-[0.99] focus-ring flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ transitionProperty: 'background-color, box-shadow, transform', transitionDuration: '150ms' }}
            >
              {isPending ? 'Creating account…' : 'Create account'}
              {!isPending && <ArrowRight size={16} strokeWidth={2.5} />}
            </button>
          </form>
          )}

          <p className="text-center text-body-sm text-ink-secondary mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-sage-600 hover:text-sage-700 font-medium transition-colors duration-150">
              Sign in
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

import { Suspense } from 'react'

export default function SignupPage() {
  return (
    <Suspense>
      <SignupPageInner />
    </Suspense>
  )
}
