'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[Dashboard error]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] px-6 text-center">
      <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center mb-4">
        <AlertTriangle size={22} className="text-danger" strokeWidth={1.75} />
      </div>
      <h2 className="font-display text-display-sm font-bold text-ink mb-2">
        Something went wrong
      </h2>
      <p className="text-body-sm text-ink-secondary max-w-sm mb-6">
        {error.message || 'An unexpected error occurred while loading this page.'}
      </p>
      <button
        onClick={reset}
        className="flex items-center gap-2 px-5 py-2.5 bg-sage-500 text-white font-medium text-body-sm rounded-pill shadow-button hover:bg-sage-600 focus-ring"
        style={{ transitionProperty: 'background-color', transitionDuration: '150ms' }}
      >
        <RefreshCw size={14} strokeWidth={2} />
        Try again
      </button>
    </div>
  )
}
