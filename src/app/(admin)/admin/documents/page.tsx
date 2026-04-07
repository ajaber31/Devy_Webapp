import { PageHeader } from '@/components/shared/PageHeader'
import { DocumentUploadZone } from '@/components/admin/DocumentUploadZone'
import { DocumentTable } from '@/components/admin/DocumentTable'

export default function AdminDocumentsPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Global Knowledge Base"
        description="Centrally managed, expert-reviewed source materials. Every answer Devy gives is grounded in these approved documents — available to all platform users."
      />
      <DocumentUploadZone />
      <DocumentTable />
    </div>
  )
}
