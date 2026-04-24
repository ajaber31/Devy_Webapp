'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, ArrowRight, Check, AlertCircle, MailCheck, Zap, Crown, Stethoscope } from 'lucide-react'
import { DevyLogo } from '@/components/shared/DevyLogo'
import { NoiseTexture } from '@/components/shared/NoiseTexture'
import { useLanguage } from '@/components/shared/LanguageProvider'
import { cn } from '@/lib/utils'
import { signUp } from '@/lib/actions/auth'
import type { PlanId } from '@/lib/types'

const PLAN_META: Record<string, { price: string; icon: React.ReactNode; planKey: 'starter' | 'pro' | 'clinician' }> = {
  starter: {
    price: '$14 CAD/mo',
    icon: <Zap size={13} className="text-dblue-500" strokeWidth={2} />,
    planKey: 'starter',
  },
  pro: {
    price: '$24 CAD/mo',
    icon: <Crown size={13} className="text-sage-600" strokeWidth={2} />,
    planKey: 'pro',
  },
  clinician: {
    price: '$39 CAD/mo',
    icon: <Stethoscope size={13} className="text-sand-600" strokeWidth={2} />,
    planKey: 'clinician',
  },
}

const ACCOUNT_TYPE_VALUES = ['parent', 'caregiver', 'clinician_professional', 'teacher', 'other'] as const
type AccountTypeValue = typeof ACCOUNT_TYPE_VALUES[number]

const ACCOUNT_TYPE_ICONS: Record<AccountTypeValue, string> = {
  parent: '🏠',
  caregiver: '🤝',
  clinician_professional: '🩺',
  teacher: '📚',
  other: '✨',
}

function SignupPageInner() {
  const searchParams = useSearchParams()
  const { t } = useLanguage()
  const s = t.auth.signup
  const planParam = searchParams.get('plan') as PlanId | null
  const selectedPlan = planParam && planParam in PLAN_META ? planParam : null
  const selectedPlanMeta = selectedPlan ? PLAN_META[selectedPlan] : null
  const selectedPlanName = selectedPlanMeta ? t.plans[selectedPlanMeta.planKey].name : ''

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
      setError(t.validation.passwordsDoNotMatch)
      return
    }
    if (!accountType) {
      setError(t.validation.accountTypeRequired)
      return
    }

    setIsPending(true)

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
      setSuccessMessage(result.message ?? s.checkEmailBody)
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
            <h1 className="font-display text-display-md font-bold text-ink tracking-tight mb-2">{s.title}</h1>
            <p className="text-body-sm text-ink-secondary">
              {selectedPlan ? s.subtitleWithPlan : s.subtitle}
            </p>
          </div>

          {selectedPlanMeta && (
            <div className="flex items-center gap-3 px-4 py-3 bg-sage-50 border border-sage-200 rounded-card mb-5">
              <div className="w-7 h-7 rounded-full bg-white border border-sage-200 flex items-center justify-center shrink-0">
                {selectedPlanMeta.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-body-xs font-semibold text-sage-800">
                  {selectedPlanName} · {selectedPlanMeta.price}
                </p>
                <p className="text-body-xs text-sage-600">
                  {s.planNote.replace('{plan}', selectedPlanName)}
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
                <h2 className="font-display text-display-sm font-semibold text-ink mb-1.5">{s.checkEmailTitle}</h2>
                <p className="text-body-sm text-ink-secondary">{successMessage}</p>
                <p className="text-body-xs text-ink-tertiary mt-2">
                  {s.checkEmailFooter}
                </p>
              </div>
              <Link
                href="/login"
                className="mt-2 px-6 py-2.5 bg-sage-500 text-white font-medium text-body-sm rounded-pill shadow-button hover:bg-sage-600 focus-ring"
                style={{ transitionProperty: 'background-color', transitionDuration: '150ms' }}
              >
                {t.auth.reset.goToSignIn}
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
            <div>
              <label htmlFor="name" className="block text-body-sm font-medium text-ink mb-1.5">{s.nameLabel}</label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                {...field('name')}
                placeholder={s.namePlaceholder}
                className="w-full px-4 py-2.5 bg-surface border border-border rounded-card text-body-sm text-ink placeholder:text-ink-tertiary shadow-input focus:outline-none focus:shadow-input-focus focus:border-sage-400"
                style={{ transitionProperty: 'border-color, box-shadow', transitionDuration: '150ms' }}
              />
            </div>

            <div>
              <label htmlFor="signup-email" className="block text-body-sm font-medium text-ink mb-1.5">{s.emailLabel}</label>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                required
                {...field('email')}
                placeholder={s.emailPlaceholder}
                className="w-full px-4 py-2.5 bg-surface border border-border rounded-card text-body-sm text-ink placeholder:text-ink-tertiary shadow-input focus:outline-none focus:shadow-input-focus focus:border-sage-400"
                style={{ transitionProperty: 'border-color, box-shadow', transitionDuration: '150ms' }}
              />
            </div>

            <div>
              <label htmlFor="signup-password" className="block text-body-sm font-medium text-ink mb-1.5">{s.passwordLabel}</label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  {...field('password')}
                  placeholder={s.passwordPlaceholder}
                  className="w-full px-4 py-2.5 pr-10 bg-surface border border-border rounded-card text-body-sm text-ink placeholder:text-ink-tertiary shadow-input focus:outline-none focus:shadow-input-focus focus:border-sage-400"
                  style={{ transitionProperty: 'border-color, box-shadow', transitionDuration: '150ms' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-tertiary hover:text-ink-secondary transition-colors duration-150 focus-ring rounded"
                  aria-label={showPassword ? t.common.dismiss : t.common.learnMore}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm" className="block text-body-sm font-medium text-ink mb-1.5">{s.confirmLabel}</label>
              <input
                id="confirm"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                {...field('confirm')}
                placeholder={s.confirmPlaceholder}
                className="w-full px-4 py-2.5 bg-surface border border-border rounded-card text-body-sm text-ink placeholder:text-ink-tertiary shadow-input focus:outline-none focus:shadow-input-focus focus:border-sage-400"
                style={{ transitionProperty: 'border-color, box-shadow', transitionDuration: '150ms' }}
              />
            </div>

            <div>
              <p className="text-body-sm font-medium text-ink mb-2.5">{s.accountTypeLabel}</p>
              <div className="grid grid-cols-2 gap-3">
                {ACCOUNT_TYPE_VALUES.map((value) => {
                  const selected = accountType === value
                  const isOther = value === 'other'
                  const label = t.accountType[value]
                  const description = t.accountType[
                    value === 'clinician_professional' ? 'clinicianDesc'
                    : value === 'parent'   ? 'parentDesc'
                    : value === 'caregiver' ? 'caregiverDesc'
                    : value === 'teacher'  ? 'teacherDesc'
                    : 'otherDesc'
                  ]
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setAccountType(value)}
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
                      <span className="text-lg leading-none">{ACCOUNT_TYPE_ICONS[value]}</span>
                      <span className="text-body-sm font-semibold text-ink">{label}</span>
                      <span className="text-body-xs text-ink-tertiary leading-snug">{description}</span>
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
              {isPending ? s.submitting : s.submit}
              {!isPending && <ArrowRight size={16} strokeWidth={2.5} />}
            </button>
          </form>
          )}

          <p className="text-center text-body-sm text-ink-secondary mt-6">
            {s.existingAccount}{' '}
            <Link href="/login" className="text-sage-600 hover:text-sage-700 font-medium transition-colors duration-150">
              {s.signIn}
            </Link>
          </p>
        </div>

        <p className="text-center text-body-xs text-ink-tertiary mt-6 px-4">
          {s.disclaimer}
        </p>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupPageInner />
    </Suspense>
  )
}
