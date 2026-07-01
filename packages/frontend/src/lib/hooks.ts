'use client'

import { useState, useEffect, useRef } from 'react'

export function useCountUp(end: number, duration = 2000) {
  const [count, setCount] = useState(0)
  const prevEnd = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (prevEnd.current === end) return
    prevEnd.current = end
    const start = performance.now()
    const step = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(ease * end))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [end, duration])

  return count.toLocaleString()
}
