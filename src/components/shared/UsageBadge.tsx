import { cn } from '@/lib/utils'

interface UsageBadgeProps {
  current: number
  /** Maximum allowed. -1 means unlimited. */
  limit: number
  label: string
  className?: string
}

/**
 * Inline usage indicator with a thin progress bar.
 * Used in chat header and children page to show current plan usage.
 */
export function UsageBadge({ current, limit, label, className }: UsageBadgeProps) {
  if (limit === -1) {
    return (
      <div className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 bg-sage-50 border border-sage-200 rounded-pill',
        className,
      )}>
        <span className="w-1.5 h-1.5 rounded-full bg-sage-400 shrink-0" />
        <span className="text-body-xs text-sage-700 font-medium">{label}: Unlimited</span>
      </div>
    )
  }

  const pct = Math.min((current / limit) * 100, 100)
  const isAtLimit = current >= limit
  const isNearLimit = pct >= 80

  return (
    <div className={cn(
      'inline-flex items-center gap-2 px-2.5 py-1 rounded-pill border',
      isAtLimit
        ? 'bg-red-50 border-red-200'
        : isNearLimit
          ? 'bg-sand-50 border-sand-200'
          : 'bg-surface border-border',
      className,
    )}>
      {/* Mini progress arc */}
      <div className="relative w-3 h-3 shrink-0">
        <div className={cn(
          'w-full h-full rounded-full',
          isAtLimit ? 'bg-red-300' : isNearLimit ? 'bg-sand-300' : 'bg-border',
        )}>
          <div
            className={cn(
              'absolute inset-0 rounded-full',
              isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-sand-500' : 'bg-sage-500',
            )}
            style={{
              clipPath: `inset(0 ${100 - pct}% 0 0)`,
            }}
          />
        </div>
      </div>

      <span className={cn(
        'text-body-xs font-medium',
        isAtLimit ? 'text-red-700' : isNearLimit ? 'text-sand-700' : 'text-ink-secondary',
      )}>
        {label}: {current}/{limit}
      </span>
    </div>
  )
}
