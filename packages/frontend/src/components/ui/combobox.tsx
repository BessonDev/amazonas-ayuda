'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from './input'
import { cn } from '@/lib/utils'

interface Item {
  id: number
  label: string
  subtitle?: string
}

interface ComboboxProps {
  items: Item[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  className?: string
}

export function Combobox({
  items,
  value,
  onValueChange,
  placeholder = 'Seleccionar...',
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'Sin resultados',
  className,
}: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = items.find((i) => i.id.toString() === value)

  const filtered = items.filter((i) =>
    i.label.toLowerCase().includes(search.toLowerCase()) ||
    (i.subtitle ?? '').toLowerCase().includes(search.toLowerCase()),
  )

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => { setOpen(!open); setSearch('') }}
        className={cn(
          'flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors',
          'hover:bg-accent hover:text-accent-foreground',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          !value && 'text-muted-foreground',
        )}
      >
        {selected ? selected.label : placeholder}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn('ml-2 size-4 shrink-0 opacity-50 transition-transform', open && 'rotate-180')}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
          <div className="flex items-center border-b px-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 size-4 shrink-0 opacity-50"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <Input
              ref={inputRef as any}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </div>
            ) : (
              filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onValueChange(item.id.toString())
                    setOpen(false)
                    setSearch('')
                  }}
                  className={cn(
                    'flex w-full flex-col gap-0.5 px-3 py-2 text-left text-sm transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    value === item.id.toString() && 'bg-accent font-medium text-accent-foreground',
                  )}
                >
                  <span>{item.label}</span>
                  {item.subtitle && (
                    <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
