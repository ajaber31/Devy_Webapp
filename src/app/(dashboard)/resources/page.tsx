import { getDocuments } from '@/lib/actions/documents'
import { ResourcesPageContent } from './ResourcesPageContent'

export default async function ResourcesPage() {
  const all = await getDocuments()
  const documents = all.filter(d => d.status === 'ready')
  return <ResourcesPageContent documents={documents} />
}
