'use client'

import { useLanguage } from './LanguageProvider'
import { cn } from '@/lib/utils'

interface LanguageSwitcherProps {
  className?: string
  /** 'pill' shows EN | FR as a toggle. 'minimal' shows just the inactive lang. */
  variant?: 'pill' | 'minimal'
}

export function LanguageSwitcher({ className, variant = 'pill' }: LanguageSwitcherProps) {
  const { lang, setLang } = useLanguage()

  if (variant === 'minimal') {
    const next = lang === 'en' ? 'fr' : 'en'
    const label = lang === 'en' ? 'FR' : 'EN'
    return (
      <button
        onClick={() => setLang(next)}
        className={cn(
          'text-body-xs font-semibold text-ink-secondary hover:text-ink tracking-wide uppercase focus-ring rounded-sm px-1',
          className,
        )}
        style={{ transitionProperty: 'color', transitionDuration: '150ms' }}
        aria-label={`Switch to ${lang === 'en' ? 'French' : 'English'}`}
      >
        {label}
      </button>
    )
  }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-pill border border-border bg-raised p-0.5 gap-0.5',
        className,
      )}
      role="group"
      aria-label="Language selector"
    >
      {(['en', 'fr'] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={cn(
            'px-2.5 py-1 rounded-full text-body-xs font-semibold uppercase tracking-wide focus-ring',
            lang === l
              ? 'bg-white text-ink shadow-card'
              : 'text-ink-tertiary hover:text-ink-secondary',
          )}
          style={{ transitionProperty: 'background-color, color, box-shadow', transitionDuration: '150ms' }}
          aria-pressed={lang === l}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
