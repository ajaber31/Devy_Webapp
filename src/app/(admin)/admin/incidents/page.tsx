import { getIncidents } from '@/lib/actions/incidents'
import { IncidentsPageContent } from './IncidentsPageContent'

export const metadata = {
  title: 'Incident Log — Devy Admin',
  robots: 'noindex',
}

export default async function IncidentsPage() {
  const incidents = await getIncidents()

  return <IncidentsPageContent initialIncidents={incidents} />
}
