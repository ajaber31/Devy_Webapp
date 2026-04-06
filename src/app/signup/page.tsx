'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, ArrowRight, Check } from 'lucide-react'
import { DevyLogo } from '@/components/shared/DevyLogo'
import { NoiseTexture } from '@/components/shared/NoiseTexture'
import { ACCOUNT_TYPE_OPTIONS } from '@/lib/constants'
import { cn } from '@/lib/utils'

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [accountType, setAccountType] = useState<string>('')
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    window.location.href = '/dashboard'
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

          <form onSubmit={handleSubmit} className="space-y-5">
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
                type="password"
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
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setAccountType(option.value)}
                      className={cn(
                        'relative flex flex-col items-start gap-1.5 p-4 rounded-card border text-left',
                        'focus-ring',
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
              className="w-full py-3 bg-sage-500 text-white font-medium text-body-base rounded-pill shadow-button hover:bg-sage-600 hover:shadow-button-hover active:scale-[0.99] focus-ring flex items-center justify-center gap-2 mt-2"
              style={{ transitionProperty: 'background-color, box-shadow, transform', transitionDuration: '150ms' }}
            >
              Create account
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </form>

          <p className="text-center text-body-sm text-ink-secondary mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-sage-600 hover:text-sage-700 font-medium transition-colors duration-150">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-body-xs text-ink-tertiary mt-6 px-4">
          By creating an account, you agree to our{' '}
          <Link href="#" className="underline hover:text-ink-secondary transition-colors duration-150">Terms</Link>
          {' '}and{' '}
          <Link href="#" className="underline hover:text-ink-secondary transition-colors duration-150">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  )
}
