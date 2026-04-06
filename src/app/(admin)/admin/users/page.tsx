'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { UserSearchFilter } from '@/components/admin/UserSearchFilter'
import { UserTable } from '@/components/admin/UserTable'
import { mockUsers } from '@/lib/mock-data/users'

export default function AdminUsersPage() {
  const [query, setQuery]   = useState('')
  const [role, setRole]     = useState('')
  const [status, setStatus] = useState('')

  const filtered = mockUsers.filter(u => {
    const matchesQuery = !query || u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase())
    const matchesRole  = !role   || u.role === role
    const matchesStatus = !status || u.status === status
    return matchesQuery && matchesRole && matchesStatus
  })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Team members"
        description={`${mockUsers.length} users in your organization.`}
      />

      {/* Stats row */}
      <div className="grid grid-cols-3 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Active users',    value: mockUsers.filter(u => u.status === 'active').length,    color: 'text-success' },
          { label: 'Pending invites', value: mockUsers.filter(u => u.status === 'invited').length,   color: 'text-warning' },
          { label: 'Suspended',       value: mockUsers.filter(u => u.status === 'suspended').length, color: 'text-danger' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-card shadow-card border border-border/50 p-4 text-center">
            <p className={`font-display text-display-md font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-body-xs text-ink-secondary mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <UserSearchFilter
        query={query}
        onQueryChange={setQuery}
        role={role}
        onRoleChange={setRole}
        status={status}
        onStatusChange={setStatus}
        onInvite={() => {}}
      />

      <UserTable users={filtered} />
    </div>
  )
}
