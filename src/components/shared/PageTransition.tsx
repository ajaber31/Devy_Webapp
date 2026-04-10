'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Wraps page content in a fade-up transition that re-triggers on every route change.
 * Place this around the <main> content in the dashboard layout.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Reset to invisible, then on the next animation frame reveal
    setVisible(false)
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [pathname])

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0px)' : 'translateY(14px)',
        transition: 'opacity 0.38s cubic-bezier(0.16, 1, 0.3, 1), transform 0.38s cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'opacity, transform',
        height: '100%',
      }}
    >
      {children}
    </div>
  )
}
