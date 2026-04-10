'use client'

import { Search } from 'lucide-react'

interface UserSearchFilterProps {
  query: string
  onQueryChange: (q: string) => void
  role: string
  onRoleChange: (r: string) => void
  status: string
  onStatusChange: (s: string) => void
}

export function UserSearchFilter({
  query, onQueryChange, role, onRoleChange, status, onStatusChange
}: UserSearchFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
      {/* Search */}
      <div className="relative flex-1 min-w-0 w-full sm:max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
        <input
          type="search"
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          placeholder="Search users…"
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-border rounded-card text-body-sm placeholder:text-ink-tertiary shadow-input focus:outline-none focus:border-sage-400 focus:shadow-input-focus"
          style={{ transitionProperty: 'border-color, box-shadow', transitionDuration: '150ms' }}
        />
      </div>

      {/* Role filter */}
      <select
        value={role}
        onChange={e => onRoleChange(e.target.value)}
        className="px-3 py-2.5 bg-white border border-border rounded-card text-body-sm text-ink shadow-input focus:outline-none focus:border-sage-400 focus:shadow-input-focus"
        style={{ transitionProperty: 'border-color, box-shadow', transitionDuration: '150ms' }}
      >
        <option value="">All roles</option>
        <option value="parent">Parent</option>
        <option value="caregiver">Caregiver</option>
        <option value="clinician">Clinician</option>
        <option value="teacher">Teacher</option>
        <option value="other">Other</option>
        <option value="admin">Admin</option>
      </select>

      {/* Status filter */}
      <select
        value={status}
        onChange={e => onStatusChange(e.target.value)}
        className="px-3 py-2.5 bg-white border border-border rounded-card text-body-sm text-ink shadow-input focus:outline-none focus:border-sage-400 focus:shadow-input-focus"
        style={{ transitionProperty: 'border-color, box-shadow', transitionDuration: '150ms' }}
      >
        <option value="">All statuses</option>
        <option value="active">Active</option>
        <option value="invited">Invited</option>
        <option value="suspended">Suspended</option>
      </select>
    </div>
  )
}
