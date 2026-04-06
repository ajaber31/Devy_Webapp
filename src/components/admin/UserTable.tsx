import { MoreHorizontal } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import { formatDate, initials } from '@/lib/utils'
import type { User } from '@/lib/types'

const roleColorMap: Record<string, string> = {
  clinician: 'bg-sage-100 text-sage-700',
  teacher:   'bg-dblue-100 text-dblue-700',
  parent:    'bg-sand-100 text-sand-500',
  caregiver: 'bg-sand-100 text-sand-500',
  admin:     'bg-raised text-ink-secondary',
}

interface UserTableProps {
  users: User[]
}

export function UserTable({ users }: UserTableProps) {
  return (
    <div className="bg-white rounded-card-lg shadow-card border border-border/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface">
              {['User', 'Role', 'Status', 'Organization', 'Last active', ''].map((h, i) => (
                <th key={i} className="px-4 py-3 text-left text-body-xs font-semibold text-ink-secondary uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-border/50 last:border-0 hover:bg-surface/70 group"
                style={{ transitionProperty: 'background-color', transitionDuration: '150ms' }}
              >
                {/* User */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-sage-100 text-sage-700 flex items-center justify-center text-body-xs font-semibold flex-shrink-0">
                      {initials(user.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-body-sm font-medium text-ink truncate">{user.name}</p>
                      <p className="text-body-xs text-ink-tertiary truncate">{user.email}</p>
                    </div>
                  </div>
                </td>

                {/* Role */}
                <td className="px-4 py-3.5">
                  <span className={`inline-block px-2.5 py-1 rounded-pill text-body-xs font-medium capitalize ${roleColorMap[user.role] ?? 'bg-raised text-ink-secondary'}`}>
                    {user.role}
                  </span>
                </td>

                {/* Status */}
                <td className="px-4 py-3.5">
                  <StatusBadge type="user" status={user.status} />
                </td>

                {/* Organization */}
                <td className="px-4 py-3.5 text-body-sm text-ink-secondary whitespace-nowrap">
                  {user.organization ?? '—'}
                </td>

                {/* Last active */}
                <td className="px-4 py-3.5 text-body-sm text-ink-secondary whitespace-nowrap">
                  {formatDate(user.lastActiveAt)}
                </td>

                {/* Actions */}
                <td className="px-4 py-3.5">
                  <button
                    className="p-1.5 rounded text-ink-tertiary hover:text-ink hover:bg-raised focus-ring opacity-0 group-hover:opacity-100"
                    style={{ transitionProperty: 'color, background-color, opacity', transitionDuration: '150ms' }}
                    aria-label="More actions"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </td>
              </tr>
            ))}

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
