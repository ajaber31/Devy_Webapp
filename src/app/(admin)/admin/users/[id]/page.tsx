import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getUserDetail } from '@/lib/actions/admin'
import { UserDetailTabs } from './UserDetailTabs'

interface Props {
  params: { id: string }
}

export default async function UserDetailPage({ params }: Props) {
  const detail = await getUserDetail(params.id)
  if (!detail) notFound()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back link */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-body-sm text-ink-tertiary hover:text-ink mb-6 focus-ring rounded"
        style={{ transitionProperty: 'color', transitionDuration: '150ms' }}
      >
        <ArrowLeft size={14} strokeWidth={2} />
        All users
      </Link>

      <UserDetailTabs detail={detail} />
    </div>
  )
}
