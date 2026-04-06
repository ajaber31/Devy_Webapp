import { cn } from '@/lib/utils'

interface DevyLogoProps {
  variant?: 'full' | 'mark'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  light?: boolean
}

const sizes = {
  sm: { mark: 24, text: 'text-lg' },
  md: { mark: 30, text: 'text-xl' },
  lg: { mark: 38, text: 'text-2xl' },
}

export function DevyLogo({ variant = 'full', size = 'md', className, light }: DevyLogoProps) {
  const { mark: markSize, text: textSize } = sizes[size]

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      {/* Mark: stylized leaf/sprout */}
      <svg
        width={markSize}
        height={markSize}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Background circle */}
        <circle cx="16" cy="16" r="16" fill={light ? 'rgba(255,255,255,0.15)' : '#E4EBE0'} />
        {/* Leaf shape */}
        <path
          d="M16 6C16 6 9 10 9 17.5C9 21.09 12.13 24 16 24C19.87 24 23 21.09 23 17.5C23 10 16 6 16 6Z"
          fill={light ? 'rgba(255,255,255,0.9)' : '#5C8651'}
        />
        {/* Center vein */}
        <path
          d="M16 24V14"
          stroke={light ? 'rgba(255,255,255,0.4)' : '#E4EBE0'}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Small dot at top */}
        <circle cx="16" cy="8" r="1.5" fill={light ? 'rgba(255,255,255,0.6)' : '#7DA370'} />
      </svg>

      {variant === 'full' && (
        <span
          className={cn(
            'font-display font-semibold tracking-[-0.02em]',
            textSize,
            light ? 'text-white' : 'text-ink'
          )}
        >
          Devy
        </span>
      )}
    </div>
  )
}
