'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MoreHorizontal, ShieldOff, ShieldCheck, ChevronRight, Star, StarOff } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import { formatDate, initials } from '@/lib/utils'
import type { User, UserRole, UserStatus, PlanId } from '@/lib/types'

const roleColorMap: Record<string, string> = {
  clinician: 'bg-sage-100 text-sage-700',
  teacher:   'bg-dblue-100 text-dblue-700',
  parent:    'bg-sand-100 text-sand-500',
  caregiver: 'bg-sand-100 text-sand-500',
  other:     'bg-raised text-ink-secondary',
  admin:     'bg-raised text-ink-secondary',
}

const roleLabelMap: Record<string, string> = {
  clinician: 'Clinician',
  teacher:   'Teacher',
  parent:    'Parent',
  caregiver: 'Caregiver',
  other:     'Other',
  admin:     'Admin',
}

const planLabelMap: Record<PlanId, string> = {
  free:           'Free',
  starter:        'Starter',
  pro:            'Pro',
  clinician:      'Clinician',
  petits_genies:  'Petits Génies',
}

const planColorMap: Record<PlanId, string> = {
  free:           'bg-raised text-ink-tertiary',
  starter:        'bg-dblue-50 text-dblue-600',
  pro:            'bg-dblue-100 text-dblue-700',
  clinician:      'bg-sage-100 text-sage-700',
  petits_genies:  'bg-sage-200 text-sage-800 ring-1 ring-sage-400/40',
}

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'parent',    label: 'Parent' },
  { value: 'caregiver', label: 'Caregiver' },
  { value: 'clinician', label: 'Clinician' },
  { value: 'teacher',   label: 'Teacher' },
  { value: 'other',     label: 'Other' },
]

interface UserTableProps {
  users: User[]
  onStatusChange?: (id: string, status: UserStatus) => void
  onRoleChange?: (id: string, role: UserRole) => void
  onGrantPetitsGenies?: (id: string) => void
  onRevokeSponsoredPlan?: (id: string) => void
}

export function UserTable({ users, onStatusChange, onRoleChange, onGrantPetitsGenies, onRevokeSponsoredPlan }: UserTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [roleSubmenuId, setRoleSubmenuId] = useState<string | null>(null)

  const closeAll = () => {
    setOpenMenuId(null)
    setRoleSubmenuId(null)
  }

  return (
    <div className="bg-white rounded-card-lg shadow-card border border-border/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface">
              {['User', 'Account Type', 'Plan', 'Status', 'Last active', ''].map((h, i) => (
                <th key={i} className="px-4 py-3 text-left text-body-xs font-semibold text-ink-secondary uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const planId = (user.planId ?? 'free') as PlanId
              const isPetitsGenies = planId === 'petits_genies'

              return (
                <tr
                  key={user.id}
                  className="border-b border-border/50 last:border-0 hover:bg-surface/70 group"
                  style={{ transitionProperty: 'background-color', transitionDuration: '150ms' }}
                >
                  {/* User */}
                  <td className="px-4 py-3.5">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="flex items-center gap-3 group/user focus-ring rounded"
                    >
                      <div className="w-9 h-9 rounded-full bg-sage-100 text-sage-700 flex items-center justify-center text-body-xs font-semibold flex-shrink-0">
                        {initials(user.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-body-sm font-medium text-ink truncate group-hover/user:text-sage-700" style={{ transitionProperty: 'color', transitionDuration: '150ms' }}>{user.name}</p>
                        <p className="text-body-xs text-ink-tertiary truncate">{user.email}</p>
                      </div>
                    </Link>
                  </td>

                  {/* Account Type */}
                  <td className="px-4 py-3.5">
                    <span className={`inline-block px-2.5 py-1 rounded-pill text-body-xs font-medium capitalize ${roleColorMap[user.role] ?? 'bg-raised text-ink-secondary'}`}>
                      {roleLabelMap[user.role] ?? user.role}
                    </span>
                  </td>

                  {/* Plan */}
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-pill text-body-xs font-medium ${planColorMap[planId]}`}>
                      {isPetitsGenies && <Star size={10} className="fill-sage-600 text-sage-600" />}
                      {planLabelMap[planId]}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5">
                    <StatusBadge type="user" status={user.status} />
                  </td>

                  {/* Last active */}
                  <td className="px-4 py-3.5 text-body-sm text-ink-secondary whitespace-nowrap">
                    {formatDate(user.lastActiveAt)}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 relative">
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => {
                          if (openMenuId === user.id) { closeAll() } else { setOpenMenuId(user.id); setRoleSubmenuId(null) }
                        }}
                        className="p-1.5 rounded text-ink-tertiary hover:text-ink hover:bg-raised focus-ring opacity-0 group-hover:opacity-100"
                        style={{ transitionProperty: 'color, background-color, opacity', transitionDuration: '150ms' }}
                        aria-label="More actions"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    )}

                    {openMenuId === user.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={closeAll} />

                        <div className="absolute right-4 top-full mt-1 bg-white rounded-card shadow-floating border border-border py-1 z-20 min-w-[200px]">
                          {/* Suspend / Reactivate */}
                          {user.status === 'suspended' ? (
                            <button
                              onClick={() => { onStatusChange?.(user.id, 'active'); closeAll() }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-body-sm text-ink-secondary hover:bg-raised hover:text-ink"
                              style={{ transitionProperty: 'background-color, color', transitionDuration: '150ms' }}
                            >
                              <ShieldCheck size={13} className="text-sage-600" />
                              Reactivate user
                            </button>
                          ) : (
                            <button
                              onClick={() => { onStatusChange?.(user.id, 'suspended'); closeAll() }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-body-sm text-danger hover:bg-raised"
                              style={{ transitionProperty: 'background-color', transitionDuration: '150ms' }}
                            >
                              <ShieldOff size={13} />
                              Suspend user
                            </button>
                          )}

                          <div className="h-px bg-border my-1" />

                          {/* Grant / Revoke Petits Génies */}
                          {isPetitsGenies ? (
                            <button
                              onClick={() => { onRevokeSponsoredPlan?.(user.id); closeAll() }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-body-sm text-ink-secondary hover:bg-raised hover:text-ink"
                              style={{ transitionProperty: 'background-color, color', transitionDuration: '150ms' }}
                            >
                              <StarOff size={13} className="text-sand-500" />
                              Revoke Petits Génies
                            </button>
                          ) : (
                            <button
                              onClick={() => { onGrantPetitsGenies?.(user.id); closeAll() }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-body-sm text-ink-secondary hover:bg-raised hover:text-ink"
                              style={{ transitionProperty: 'background-color, color', transitionDuration: '150ms' }}
                            >
                              <Star size={13} className="text-sage-600" />
                              Grant Petits Génies
                            </button>
                          )}

                          <div className="h-px bg-border my-1" />

                          {/* Change role — submenu trigger */}
                          <div className="relative">
                            <button
                              onClick={() => setRoleSubmenuId(roleSubmenuId === user.id ? null : user.id)}
                              className="w-full flex items-center justify-between gap-2 px-3 py-2 text-body-sm text-ink-secondary hover:bg-raised hover:text-ink"
                              style={{ transitionProperty: 'background-color, color', transitionDuration: '150ms' }}
                            >
                              <span>Change role</span>
                              <ChevronRight size={12} strokeWidth={2} />
                            </button>

                            {roleSubmenuId === user.id && (
                              <div className="absolute right-full top-0 mr-1 bg-white rounded-card shadow-floating border border-border py-1 min-w-[130px]">
                                {ROLE_OPTIONS.map(opt => (
                                  <button
                                    key={opt.value}
                                    onClick={() => { onRoleChange?.(user.id, opt.value); closeAll() }}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-body-sm hover:bg-raised ${user.role === opt.value ? 'text-sage-700 font-medium' : 'text-ink-secondary hover:text-ink'}`}
                                    style={{ transitionProperty: 'background-color, color', transitionDuration: '150ms' }}
                                  >
                                    {opt.label}
                                    {user.role === opt.value && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sage-500" />}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              )
            })}

            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-body-sm text-ink-tertiary">
                  No users match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
