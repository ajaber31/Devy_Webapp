'use client'

import { useState } from 'react'
import {
  User, Users, CreditCard, MessageCircle,
  Calendar, Clock, ShieldCheck, ShieldOff,
  Zap, Crown, CheckCircle2,
} from 'lucide-react'
import { cn, initials, formatDate } from '@/lib/utils'
import { updateUserStatus, updateUserRole } from '@/lib/actions/admin'
import { PLANS } from '@/lib/stripe/plans'
import type { AdminUserDetail } from '@/lib/actions/admin'
import type { UserRole, UserStatus } from '@/lib/types'

const TABS = [
  { id: 'overview', label: 'Overview',  icon: User },
  { id: 'clients',  label: 'Clients',   icon: Users },
  { id: 'billing',  label: 'Billing',   icon: CreditCard },
]

const roleColorMap: Record<string, string> = {
  clinician: 'bg-sage-100 text-sage-700',
  teacher:   'bg-dblue-100 text-dblue-700',
  parent:    'bg-sand-100 text-sand-500',
  caregiver: 'bg-sand-100 text-sand-500',
  other:     'bg-raised text-ink-secondary',
  admin:     'bg-raised text-ink-secondary',
}

const avatarRing: Record<string, string> = {
  sage:  'ring-sage-300  bg-sage-100  text-sage-700',
  dblue: 'ring-dblue-300 bg-dblue-100 text-dblue-700',
  sand:  'ring-sand-300  bg-sand-100  text-sand-600',
}

// ─── Overview tab ─────────────────────────────────────────────────────────────

function OverviewTab({
  detail,
  onStatusChange,
  onRoleChange,
}: {
  detail: AdminUserDetail
  onStatusChange: (s: UserStatus) => void
  onRoleChange: (r: UserRole) => void
}) {
  const { user, stats } = detail
  const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
    { value: 'parent',    label: 'Parent' },
    { value: 'caregiver', label: 'Caregiver' },
    { value: 'clinician', label: 'Clinician' },
    { value: 'teacher',   label: 'Teacher' },
    { value: 'other',     label: 'Other' },
  ]

  return (
    <div className="space-y-5">
      {/* Identity card */}
      <div className="bg-white rounded-card-lg border border-border/50 shadow-card p-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-full bg-sage-100 text-sage-700 flex items-center justify-center text-display-sm font-semibold shrink-0">
            {initials(user.name)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-display-sm font-semibold text-ink">{user.name}</h2>
            <p className="text-body-sm text-ink-secondary">{user.email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={cn('px-2.5 py-0.5 rounded-pill text-body-xs font-medium', roleColorMap[user.role] ?? 'bg-raised text-ink-secondary')}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
              <span className={cn(
                'px-2.5 py-0.5 rounded-pill text-body-xs font-medium border',
                user.status === 'active'    ? 'bg-sage-50 text-sage-700 border-sage-200' :
                user.status === 'suspended' ? 'bg-red-50 text-red-600 border-red-200' :
                                             'bg-raised text-ink-tertiary border-border'
              )}>
                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
          <div>
            <p className="text-body-xs text-ink-tertiary flex items-center gap-1 mb-0.5"><Calendar size={11} /> Joined</p>
            <p className="text-body-sm font-medium text-ink">{formatDate(user.joinedAt)}</p>
          </div>
          <div>
            <p className="text-body-xs text-ink-tertiary flex items-center gap-1 mb-0.5"><Clock size={11} /> Last active</p>
            <p className="text-body-sm font-medium text-ink">{formatDate(user.lastActiveAt)}</p>
          </div>
          <div>
            <p className="text-body-xs text-ink-tertiary flex items-center gap-1 mb-0.5"><MessageCircle size={11} /> Conversations</p>
            <p className="text-body-sm font-medium text-ink">{stats.conversationCount}</p>
          </div>
          <div>
            <p className="text-body-xs text-ink-tertiary flex items-center gap-1 mb-0.5"><MessageCircle size={11} /> Questions asked</p>
            <p className="text-body-sm font-medium text-ink">{stats.messageCount}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      {user.role !== 'admin' && (
        <div className="bg-white rounded-card-lg border border-border/50 shadow-card p-6">
          <h3 className="font-display text-body-base font-semibold text-ink mb-4">Account actions</h3>
          <div className="space-y-3">
            {/* Status toggle */}
            {user.status === 'suspended' ? (
              <button
                onClick={() => onStatusChange('active')}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-card border border-sage-200 bg-sage-50 text-sage-700 text-body-sm font-medium hover:bg-sage-100 focus-ring w-full sm:w-auto"
                style={{ transitionProperty: 'background-color', transitionDuration: '150ms' }}
              >
                <ShieldCheck size={15} strokeWidth={2} />
                Reactivate account
              </button>
            ) : (
              <button
                onClick={() => onStatusChange('suspended')}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-card border border-red-200 bg-red-50 text-red-600 text-body-sm font-medium hover:bg-red-100 focus-ring w-full sm:w-auto"
                style={{ transitionProperty: 'background-color', transitionDuration: '150ms' }}
              >
                <ShieldOff size={15} strokeWidth={2} />
                Suspend account
              </button>
            )}

            {/* Role picker */}
            <div>
              <label className="block text-body-xs text-ink-tertiary mb-1.5">Account role</label>
              <div className="flex flex-wrap gap-2">
                {ROLE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => onRoleChange(opt.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-card border text-body-xs font-medium focus-ring',
                      user.role === opt.value
                        ? 'bg-sage-500 text-white border-sage-500'
                        : 'bg-surface border-border text-ink-secondary hover:bg-raised'
                    )}
                    style={{ transitionProperty: 'background-color, color, border-color', transitionDuration: '150ms' }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Clients tab ──────────────────────────────────────────────────────────────

function ClientsTab({ detail }: { detail: AdminUserDetail }) {
  const { children, user } = detail
  const noun = ['clinician', 'teacher'].includes(user.role) ? 'client' : 'child'
  const nounPlural = ['clinician', 'teacher'].includes(user.role) ? 'clients' : 'children'

  if (children.length === 0) {
    return (
      <div className="bg-white rounded-card-lg border border-border/50 shadow-card p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center mx-auto mb-3">
          <Users size={20} className="text-ink-tertiary" strokeWidth={1.5} />
        </div>
        <p className="text-body-sm font-medium text-ink mb-1">No {nounPlural} yet</p>
        <p className="text-body-xs text-ink-tertiary">This user hasn&apos;t added any {noun} profiles.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-body-xs text-ink-tertiary">
        {children.length} {children.length === 1 ? noun : nounPlural}
      </p>
      {children.map(child => {
        const ring = avatarRing[child.avatarColor] ?? avatarRing.sage
        // Age calculation
        const age = child.dateOfBirth
          ? Math.floor((Date.now() - new Date(child.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
          : null

        return (
          <div
            key={child.id}
            className="bg-white rounded-card-lg border border-border/50 shadow-card p-5"
          >
            <div className="flex items-start gap-4">
              <div className={cn('w-11 h-11 rounded-full ring-2 flex items-center justify-center text-body-sm font-semibold shrink-0', ring)}>
                {initials(child.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-display font-semibold text-ink text-body-base">{child.name}</h4>
                  {age !== null && (
                    <span className="text-body-xs text-ink-tertiary">· {age} yr{age !== 1 ? 's' : ''}</span>
                  )}
                </div>

                {child.contextLabels.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {child.contextLabels.map(label => (
                      <span
                        key={label}
                        className="px-2 py-0.5 bg-sage-50 border border-sage-200 text-sage-700 text-body-xs rounded-pill"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                )}

                {child.supportNeeds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {child.supportNeeds.slice(0, 4).map(need => (
                      <span
                        key={need}
                        className="px-2 py-0.5 bg-dblue-50 border border-dblue-200 text-dblue-700 text-body-xs rounded-pill"
                      >
                        {need}
                      </span>
                    ))}
                    {child.supportNeeds.length > 4 && (
                      <span className="px-2 py-0.5 text-body-xs text-ink-tertiary">
                        +{child.supportNeeds.length - 4} more
                      </span>
                    )}
                  </div>
                )}

                <p className="text-body-xs text-ink-tertiary mt-2">
                  Added {formatDate(child.createdAt)}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Billing tab ──────────────────────────────────────────────────────────────

function BillingTab({ detail }: { detail: AdminUserDetail }) {
  const { subscription } = detail
  const planId = subscription?.planId ?? 'free'
  const plan = PLANS[planId as keyof typeof PLANS] ?? PLANS.free

  const statusStyles: Record<string, string> = {
    active:     'bg-sage-50 text-sage-700 border-sage-200',
    trialing:   'bg-dblue-50 text-dblue-700 border-dblue-200',
    past_due:   'bg-sand-50 text-sand-600 border-sand-200',
    canceled:   'bg-raised text-ink-tertiary border-border',
    incomplete: 'bg-sand-50 text-sand-600 border-sand-200',
    paused:     'bg-raised text-ink-tertiary border-border',
    free:       'bg-raised text-ink-tertiary border-border',
  }

  const subStatus = subscription?.status ?? 'free'
  const periodEnd = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <div className="bg-white rounded-card-lg border border-border/50 shadow-card p-6 space-y-6">
      {/* Plan */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-card bg-sage-100 flex items-center justify-center shrink-0">
          {planId === 'professional' ? (
            <Crown size={18} className="text-sage-600" strokeWidth={1.75} />
          ) : planId === 'standard' ? (
            <Zap size={18} className="text-dblue-500" strokeWidth={1.75} />
          ) : (
            <CreditCard size={18} className="text-ink-tertiary" strokeWidth={1.75} />
          )}
        </div>
        <div className="flex-1">
          <p className="text-body-sm font-semibold text-ink">{plan.name} plan</p>
          <p className="text-body-xs text-ink-tertiary">
            {plan.priceCAD === 0 ? 'Free' : `$${plan.priceCAD} CAD / month`}
          </p>
        </div>
        <span className={cn('px-2.5 py-0.5 rounded-pill text-body-xs font-medium border capitalize', statusStyles[subStatus] ?? statusStyles.free)}>
          {subStatus === 'free' ? 'Free plan' : subStatus.replace('_', ' ')}
        </span>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
        <div>
          <p className="text-body-xs text-ink-tertiary mb-0.5">Stripe customer</p>
          <p className="text-body-sm font-medium text-ink font-mono">
            {subscription?.stripeCustomerId ?? '—'}
          </p>
        </div>
        <div>
          <p className="text-body-xs text-ink-tertiary mb-0.5">
            {subscription?.cancelAtPeriodEnd ? 'Cancels on' : 'Renews on'}
          </p>
          <p className="text-body-sm font-medium text-ink">{periodEnd ?? '—'}</p>
        </div>
      </div>

      {/* Plan features */}
      <div className="pt-4 border-t border-border">
        <p className="text-body-xs font-medium text-ink-secondary uppercase tracking-wide mb-3">
          Included in {plan.name}
        </p>
        <ul className="space-y-2">
          {plan.features.map(f => (
            <li key={f} className="flex items-start gap-2 text-body-xs text-ink-secondary">
              <CheckCircle2 size={13} className="text-sage-500 mt-0.5 shrink-0" strokeWidth={2} />
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ─── Main tabbed component ────────────────────────────────────────────────────

export function UserDetailTabs({ detail }: { detail: AdminUserDetail }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [localDetail, setLocalDetail] = useState(detail)

  const handleStatusChange = async (status: UserStatus) => {
    setLocalDetail(prev => ({ ...prev, user: { ...prev.user, status } }))
    await updateUserStatus(localDetail.user.id, status)
  }

  const handleRoleChange = async (role: UserRole) => {
    setLocalDetail(prev => ({ ...prev, user: { ...prev.user, role } }))
    await updateUserRole(localDetail.user.id, role)
  }

  const clientCount = localDetail.children.length

  return (
    <div>
      {/* User header */}
      <div className="mb-6">
        <h1 className="font-display text-display-md font-bold text-ink tracking-tight">
          {localDetail.user.name}
        </h1>
        <p className="text-body-sm text-ink-secondary mt-0.5">{localDetail.user.email}</p>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-border mb-6">
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'relative flex items-center gap-1.5 px-4 py-2.5 text-body-sm font-medium focus-ring rounded-t-card',
                isActive ? 'text-ink' : 'text-ink-tertiary hover:text-ink-secondary'
              )}
              style={{ transitionProperty: 'color', transitionDuration: '150ms' }}
            >
              <Icon size={14} strokeWidth={isActive ? 2 : 1.75} />
              {tab.label}
              {tab.id === 'clients' && clientCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.5 bg-sage-100 text-sage-700 text-[10px] font-semibold rounded-full">
                  {clientCount}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sage-500 rounded-full" />
              )}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <OverviewTab
          detail={localDetail}
          onStatusChange={handleStatusChange}
          onRoleChange={handleRoleChange}
        />
      )}
      {activeTab === 'clients' && <ClientsTab detail={localDetail} />}
      {activeTab === 'billing' && <BillingTab detail={localDetail} />}
    </div>
  )
}
