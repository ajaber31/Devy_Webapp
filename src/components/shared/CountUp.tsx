'use client'

import { useEffect, useRef, useState } from 'react'

interface CountUpProps {
  /** The target number. Pass as a number or numeric string. */
  value: number
  duration?: number
}

/**
 * Animates a number from 0 to `value` using an ease-out cubic curve,
 * triggered once when the element enters the viewport.
 */
export function CountUp({ value, duration = 900 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el || value === 0) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()

        const startTime = performance.now()

        const tick = (now: number) => {
          const elapsed = now - startTime
          const progress = Math.min(elapsed / duration, 1)
          // Ease-out cubic
          const eased = 1 - Math.pow(1 - progress, 3)
          setDisplay(Math.round(eased * value))
          if (progress < 1) requestAnimationFrame(tick)
        }

        requestAnimationFrame(tick)
      },
      { threshold: 0.5 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [value, duration])

  return <span ref={ref}>{display}</span>
}
