'use client'

import { useState } from 'react'
import { Monitor, Sun, Moon, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const themes = [
  { id: 'light',  label: 'Light',  icon: Sun },
  { id: 'system', label: 'System', icon: Monitor },
  { id: 'dark',   label: 'Dark',   icon: Moon },
]

const fontSizes = ['Small', 'Default', 'Large']

export function AppearanceSection() {
  const [theme, setTheme] = useState('light')
  const [fontSize, setFontSize] = useState('Default')

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-card-lg shadow-card border border-border/50 p-6">
        <h3 className="font-display text-display-sm font-semibold text-ink mb-1">Theme</h3>
        <p className="text-body-sm text-ink-secondary mb-5">Choose your preferred color scheme.</p>
        <div className="flex gap-3">
          {themes.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTheme(id)}
              className={cn(
                'flex-1 flex flex-col items-center gap-2.5 py-4 rounded-card border focus-ring',
                theme === id
                  ? 'border-sage-400 bg-sage-50 ring-2 ring-sage-300 ring-offset-1'
                  : 'border-border bg-surface hover:bg-raised'
              )}
              style={{ transitionProperty: 'border-color, background-color, box-shadow', transitionDuration: '150ms' }}
            >
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', theme === id ? 'bg-sage-100 text-sage-600' : 'bg-raised text-ink-secondary')}>
                <Icon size={16} strokeWidth={1.75} />
              </div>
              <div className="flex items-center gap-1">
                {theme === id && <Check size={11} className="text-sage-600" strokeWidth={2.5} />}
                <span className={cn('text-body-xs font-medium', theme === id ? 'text-sage-700' : 'text-ink-secondary')}>{label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-card-lg shadow-card border border-border/50 p-6">
        <h3 className="font-display text-display-sm font-semibold text-ink mb-1">Font size</h3>
        <p className="text-body-sm text-ink-secondary mb-5">Adjust the text size across the app.</p>
        <div className="flex gap-3">
          {fontSizes.map((size) => (
            <button
              key={size}
              onClick={() => setFontSize(size)}
              className={cn(
                'flex-1 py-2.5 rounded-card border text-body-sm font-medium focus-ring',
                fontSize === size
                  ? 'border-sage-400 bg-sage-50 text-sage-700'
                  : 'border-border bg-surface text-ink-secondary hover:bg-raised'
              )}
              style={{ transitionProperty: 'border-color, background-color, color', transitionDuration: '150ms' }}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-card-lg shadow-card border border-border/50 p-6">
        <h3 className="font-display text-display-sm font-semibold text-ink mb-1">Sidebar</h3>
        <p className="text-body-sm text-ink-secondary mb-4">Customize the sidebar behavior.</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-body-sm font-medium text-ink">Auto-collapse on small screens</p>
            <p className="text-body-xs text-ink-secondary mt-0.5">Sidebar collapses automatically on screens narrower than 1024px.</p>
          </div>
          <div className="w-10 h-[22px] rounded-full bg-sage-500 relative cursor-default">
            <span className="absolute top-0.5 right-0.5 w-[18px] h-[18px] rounded-full bg-white shadow-card" />
          </div>
        </div>
      </div>
    </div>
  )
}
