import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-8', className)}>
      <div>
        <h1 className="font-display text-display-md font-bold text-ink tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1.5 text-body-sm text-ink-secondary max-w-lg">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}
