'use client'

import { useRef, useEffect, useState } from 'react'

interface AnimateInProps {
  children: React.ReactNode
  delay?: number
  /** Distance to travel upward (default 28px) */
  distance?: number
  /** Intersection threshold 0-1 (default 0.12) */
  threshold?: number
  className?: string
}

/**
 * Wraps children in a fade-up reveal triggered when the element enters the viewport.
 * Disconnects the observer after the first trigger so it only fires once.
 */
export function AnimateIn({
  children,
  delay = 0,
  distance = 28,
  threshold = 0.12,
  className,
}: AnimateInProps) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0px)' : `translateY(${distance}px)`,
        transition: `opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)`,
        transitionDelay: `${delay}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  )
}
