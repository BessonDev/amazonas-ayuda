'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

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

export interface FotoRecepcion {
  id: number
  nombre: string
  url: string
  mimeType: string
  createdAt: string
  viajeCodigo: string | null
  recepcionId: number
}

export function useFotosRecepciones(limit = 15) {
  return useQuery<FotoRecepcion[]>({
    queryKey: ['fotos-recepciones', limit],
    queryFn: () => api.get(`/publico/recepciones/fotos?limit=${limit}`),
    staleTime: 5 * 60 * 1000,
  })
}
