'use client'

import { useState, useEffect } from 'react'
import { Sun, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const fontSizes = [
  { id: 'small',   label: 'Small',   px: '13px' },
  { id: 'default', label: 'Default', px: '15px' },
  { id: 'large',   label: 'Large',   px: '17px' },
]

function applyFontSize(px: string) {
  document.documentElement.style.setProperty('--base-font-size', px)
}

export function AppearanceSection() {
  const [fontSize, setFontSize] = useState('default')

  // Load saved preference on mount
  useEffect(() => {
    const saved = localStorage.getItem('devy-font-size') ?? 'default'
    setFontSize(saved)
    const option = fontSizes.find(f => f.id === saved)
    if (option) applyFontSize(option.px)
  }, [])

  const handleFontSize = (id: string) => {
    setFontSize(id)
    localStorage.setItem('devy-font-size', id)
    const option = fontSizes.find(f => f.id === id)
    if (option) applyFontSize(option.px)
  }

  return (
    <div className="space-y-6">
      {/* Theme — light mode only (dark mode coming soon) */}
      <div className="bg-white rounded-card-lg shadow-card border border-border/50 p-6">
        <h3 className="font-display text-display-sm font-semibold text-ink mb-1">Theme</h3>
        <p className="text-body-sm text-ink-secondary mb-5">Devy currently uses a light theme optimised for readability.</p>
        <div className="flex gap-3">
          <div className="flex-1 flex flex-col items-center gap-2.5 py-4 rounded-card border border-sage-400 bg-sage-50 ring-2 ring-sage-300 ring-offset-1">
            <div className="w-8 h-8 rounded-full bg-sage-100 text-sage-600 flex items-center justify-center">
              <Sun size={16} strokeWidth={1.75} />
            </div>
            <div className="flex items-center gap-1">
              <Check size={11} className="text-sage-600" strokeWidth={2.5} />
              <span className="text-body-xs font-medium text-sage-700">Light</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center gap-2.5 py-4 rounded-card border border-border bg-surface opacity-40 cursor-not-allowed" title="Coming soon">
            <div className="w-8 h-8 rounded-full bg-raised text-ink-secondary flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            </div>
            <span className="text-body-xs font-medium text-ink-tertiary">Dark (soon)</span>
          </div>
        </div>
      </div>

      {/* Font size */}
      <div className="bg-white rounded-card-lg shadow-card border border-border/50 p-6">
        <h3 className="font-display text-display-sm font-semibold text-ink mb-1">Text size</h3>
        <p className="text-body-sm text-ink-secondary mb-5">Adjust the base text size across the app.</p>
        <div className="flex gap-3">
          {fontSizes.map((size) => (
            <button
              key={size.id}
              onClick={() => handleFontSize(size.id)}
              className={cn(
                'flex-1 py-2.5 rounded-card border text-body-sm font-medium focus-ring',
                fontSize === size.id
                  ? 'border-sage-400 bg-sage-50 text-sage-700'
                  : 'border-border bg-surface text-ink-secondary hover:bg-raised'
              )}
              style={{ transitionProperty: 'border-color, background-color, color', transitionDuration: '150ms' }}
            >
              {size.label}
            </button>
          ))}
        </div>
        <p className="text-body-xs text-ink-tertiary mt-3">Changes apply immediately and are saved for your next visit.</p>
      </div>
    </div>
  )
}
