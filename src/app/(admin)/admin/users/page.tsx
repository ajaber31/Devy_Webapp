import { PageHeader } from '@/components/shared/PageHeader'
import { AdminUsersPageContent } from './AdminUsersPageContent'
import { getUsers } from '@/lib/actions/admin'

export default async function AdminUsersPage() {
  const users = await getUsers()

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Platform Users"
        description={`${users.length} user${users.length !== 1 ? 's' : ''} registered on Devy.`}
      />
      <AdminUsersPageContent initialUsers={users} />
    </div>
  )
}
