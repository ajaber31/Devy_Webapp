import { PageHeader } from '@/components/shared/PageHeader'
import { DocumentsPageContent } from './DocumentsPageContent'
import { getLang } from '@/lib/i18n/server'
import { getT } from '@/lib/i18n'

export default async function AdminDocumentsPage() {
  const lang = await getLang()
  const t = getT(lang)
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title={t.admin.documents.title}
        description={t.admin.documents.description}
      />
      <DocumentsPageContent />
    </div>
  )
}
