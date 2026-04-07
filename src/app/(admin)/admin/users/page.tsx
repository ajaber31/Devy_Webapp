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
        title="Platform Users"
        description={`${mockUsers.length} users registered on Devy.`}
      />

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
