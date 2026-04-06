import { cn } from '@/lib/utils'
import type { DocumentStatus, UserStatus } from '@/lib/types'

const docStatusMap: Record<DocumentStatus, { label: string; classes: string; dot?: string }> = {
  ready:      { label: 'Ready',      classes: 'bg-success/10 text-success',  dot: 'bg-success' },
  processing: { label: 'Processing', classes: 'bg-warning/10 text-warning', dot: 'bg-warning' },
  error:      { label: 'Error',      classes: 'bg-danger/10 text-danger',   dot: 'bg-danger' },
}

const userStatusMap: Record<UserStatus, { label: string; classes: string; dot?: string }> = {
  active:    { label: 'Active',    classes: 'bg-success/10 text-success',  dot: 'bg-success' },
  invited:   { label: 'Invited',   classes: 'bg-info/10 text-info',        dot: 'bg-info' },
  suspended: { label: 'Suspended', classes: 'bg-danger/10 text-danger',    dot: 'bg-danger' },
}

interface StatusBadgeProps {
  type: 'document' | 'user'
  status: DocumentStatus | UserStatus
}

export function StatusBadge({ type, status }: StatusBadgeProps) {
  const map = type === 'document' ? docStatusMap : userStatusMap
  const config = (map as Record<string, { label: string; classes: string; dot?: string }>)[status]

  if (!config) return null

  const isProcessing = status === 'processing'

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill text-body-xs font-medium', config.classes)}>
      {isProcessing ? (
        <svg className="w-2.5 h-2.5 animate-spin" viewBox="0 0 10 10" fill="none">
          <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20" strokeDashoffset="10" />
        </svg>
      ) : (
        config.dot && <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      )}
      {config.label}
    </span>
  )
}
