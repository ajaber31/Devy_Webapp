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
      {/* Mark: stylized brain (two hemispheres) */}
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
        {(() => {
          const stroke = light ? 'rgba(255,255,255,0.92)' : '#5C8651'
          const accent = light ? 'rgba(255,255,255,0.55)' : '#7DA370'
          return (
            <g
              fill="none"
              stroke={stroke}
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Left hemisphere outline */}
              <path d="M15 8.5c-1.2-1.5-3.6-1.6-4.9-.3-.7.7-1 1.6-.9 2.5-1.4.4-2.4 1.6-2.4 3.1 0 .7.2 1.3.6 1.9-.9.6-1.4 1.6-1.4 2.7 0 1.2.7 2.3 1.7 2.8-.2 1.5.9 2.9 2.4 3.1 1 .2 2-.2 2.6-.9.7.9 1.8 1.5 3 1.5h.3" />
              {/* Right hemisphere outline */}
              <path d="M17 8.5c1.2-1.5 3.6-1.6 4.9-.3.7.7 1 1.6.9 2.5 1.4.4 2.4 1.6 2.4 3.1 0 .7-.2 1.3-.6 1.9.9.6 1.4 1.6 1.4 2.7 0 1.2-.7 2.3-1.7 2.8.2 1.5-.9 2.9-2.4 3.1-1 .2-2-.2-2.6-.9-.7.9-1.8 1.5-3 1.5h-.3" />
              {/* Central fissure */}
              <path d="M16 8v17" stroke={accent} strokeWidth="1.4" />
              {/* Squiggle details — left */}
              <path d="M11.5 12.5c1 .3 1.8 1 2.2 2" stroke={accent} strokeWidth="1.3" />
              <path d="M10.5 17c1.2 0 2.3.6 3 1.6" stroke={accent} strokeWidth="1.3" />
              {/* Squiggle details — right */}
              <path d="M20.5 12.5c-1 .3-1.8 1-2.2 2" stroke={accent} strokeWidth="1.3" />
              <path d="M21.5 17c-1.2 0-2.3.6-3 1.6" stroke={accent} strokeWidth="1.3" />
            </g>
          )
        })()}
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
