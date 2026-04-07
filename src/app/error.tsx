'use client'

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

// Root-level error boundary — catches crashes that escape nested segments,
// including (dashboard)/layout.tsx errors that the inner error.tsx cannot catch.
export default function RootError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[Root error]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-canvas">
      <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center mb-4">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-danger">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>
      <h2 className="font-display text-display-sm font-bold text-ink mb-2">Something went wrong</h2>
      <p className="text-body-sm text-ink-secondary max-w-sm mb-6">
        {error.message || 'An unexpected error occurred while loading the page.'}
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-sage-500 text-white font-medium text-body-sm rounded-pill hover:bg-sage-600"
          style={{ transitionProperty: 'background-color', transitionDuration: '150ms' }}
        >
          Try again
        </button>
        <a
          href="/login"
          className="px-5 py-2.5 bg-raised text-ink-secondary font-medium text-body-sm rounded-pill hover:bg-border"
          style={{ transitionProperty: 'background-color', transitionDuration: '150ms' }}
        >
          Back to login
        </a>
      </div>
    </div>
  )
}
