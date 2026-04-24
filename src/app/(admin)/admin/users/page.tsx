import { PageHeader } from '@/components/shared/PageHeader'
import { AdminUsersPageContent } from './AdminUsersPageContent'
import { getUsers } from '@/lib/actions/admin'
import { getLang } from '@/lib/i18n/server'
import { getT } from '@/lib/i18n'

export default async function AdminUsersPage() {
  const [users, lang] = await Promise.all([getUsers(), getLang()])
  const t = getT(lang)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title={t.admin.users.title}
        description={t.admin.users.description}
      />
      <AdminUsersPageContent initialUsers={users} />
    </div>
  )
}
