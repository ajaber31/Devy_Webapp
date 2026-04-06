import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-16 px-6', className)}>
      {icon && (
        <div className="mb-4 p-4 rounded-full bg-surface text-ink-tertiary">
          {icon}
        </div>
      )}
      <h3 className="font-display font-semibold text-display-sm text-ink mb-2">{title}</h3>
      {description && (
        <p className="text-body-sm text-ink-secondary max-w-sm">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
