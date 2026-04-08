'use client'

import { useState } from 'react'
import { DocumentUploadZone } from '@/components/admin/DocumentUploadZone'
import { DocumentTable } from '@/components/admin/DocumentTable'

export function DocumentsPageContent() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <>
      <DocumentUploadZone onSuccess={() => setRefreshKey(k => k + 1)} />
      <DocumentTable refreshKey={refreshKey} />
    </>
  )
}
