import { notFound } from 'next/navigation'
import { ChildProfileClient } from './ChildProfileClient'
import { getChild } from '@/lib/actions/children'
import { getConversationsForChild } from '@/lib/actions/conversations'
import { getProfile } from '@/lib/actions/profile'
import { getRoleTerminology } from '@/lib/role-terminology'
import { getLang } from '@/lib/i18n/server'

interface PageProps {
  params: { id: string }
}

export default async function ChildProfilePage({ params }: PageProps) {
  const [child, childConversations, profile, lang] = await Promise.all([
    getChild(params.id),
    getConversationsForChild(params.id),
    getProfile(),
    getLang(),
  ])
  const terms = getRoleTerminology(profile?.role ?? 'parent', lang)

  if (!child) notFound()

  return (
    <ChildProfileClient
      child={child}
      conversations={childConversations}
      terms={terms}
    />
  )
}
