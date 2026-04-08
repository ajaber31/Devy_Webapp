import { cn } from '@/lib/utils'
import type { DocumentStatus, UserStatus } from '@/lib/types'

interface StatusConfig {
  label: string
  classes: string
  dot?: string
  isSpinning?: boolean
}

const docStatusMap: Record<DocumentStatus, StatusConfig> = {
  uploaded:  { label: 'Queued',     classes: 'bg-info/10 text-info',     dot: 'bg-info' },
  parsing:   { label: 'Parsing',    classes: 'bg-warning/10 text-warning', isSpinning: true },
  chunking:  { label: 'Chunking',   classes: 'bg-warning/10 text-warning', isSpinning: true },
  embedding: { label: 'Embedding',  classes: 'bg-warning/10 text-warning', isSpinning: true },
  ready:     { label: 'Ready',      classes: 'bg-success/10 text-success', dot: 'bg-success' },
  failed:    { label: 'Failed',     classes: 'bg-danger/10 text-danger',   dot: 'bg-danger' },
}

const userStatusMap: Record<UserStatus, StatusConfig> = {
  active:    { label: 'Active',    classes: 'bg-success/10 text-success', dot: 'bg-success' },
  invited:   { label: 'Invited',   classes: 'bg-info/10 text-info',       dot: 'bg-info' },
  suspended: { label: 'Suspended', classes: 'bg-danger/10 text-danger',   dot: 'bg-danger' },
}

interface StatusBadgeProps {
  type: 'document' | 'user'
  status: DocumentStatus | UserStatus
}

export function StatusBadge({ type, status }: StatusBadgeProps) {
  const map = type === 'document' ? docStatusMap : userStatusMap
  const config = (map as Record<string, StatusConfig>)[status]

  if (!config) return null

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill text-body-xs font-medium', config.classes)}>
      {config.isSpinning ? (
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
