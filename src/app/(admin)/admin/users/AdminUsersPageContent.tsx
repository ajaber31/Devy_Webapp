'use client'

import { useState } from 'react'
import { UserSearchFilter } from '@/components/admin/UserSearchFilter'
import { UserTable } from '@/components/admin/UserTable'
import { updateUserStatus, updateUserRole } from '@/lib/actions/admin'
import type { User, UserRole, UserStatus } from '@/lib/types'

interface AdminUsersPageContentProps {
  initialUsers: User[]
}

export function AdminUsersPageContent({ initialUsers }: AdminUsersPageContentProps) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')

  const filtered = users.filter(u => {
    const matchesQuery = !query || u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase())
    const matchesRole  = !role   || u.role === role
    const matchesStatus = !status || u.status === status
    return matchesQuery && matchesRole && matchesStatus
  })

  const handleStatusChange = async (id: string, newStatus: UserStatus) => {
    // Optimistic update
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u))
    await updateUserStatus(id, newStatus)
  }

  const handleRoleChange = async (id: string, newRole: UserRole) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u))
    await updateUserRole(id, newRole)
  }

  return (
    <>
      <UserSearchFilter
        query={query}
        onQueryChange={setQuery}
        role={role}
        onRoleChange={setRole}
        status={status}
        onStatusChange={setStatus}
      />
      <UserTable
        users={filtered}
        onStatusChange={handleStatusChange}
        onRoleChange={handleRoleChange}
      />
    </>
  )
}
