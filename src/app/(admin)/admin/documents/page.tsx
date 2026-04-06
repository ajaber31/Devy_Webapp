import { PageHeader } from '@/components/shared/PageHeader'
import { DocumentUploadZone } from '@/components/admin/DocumentUploadZone'
import { DocumentTable } from '@/components/admin/DocumentTable'

export default function AdminDocumentsPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Knowledge Base"
        description="Upload and manage the documents that inform Devy's responses. All answers are sourced from these materials."
      />
      <DocumentUploadZone />
      <DocumentTable />
    </div>
  )
}
