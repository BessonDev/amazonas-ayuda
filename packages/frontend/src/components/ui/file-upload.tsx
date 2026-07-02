'use client'

import { useRef, useState } from 'react'
import { Image, Upload, X, File } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  accept?: string
  maxSize?: number
  disabled?: boolean
  value: File | null
  onChange: (file: File | null) => void
}

export function FileUpload({ accept = 'image/*', maxSize = 10, disabled, value, onChange }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFile = (file: File | null) => {
    setError(null)
    if (!file) {
      onChange(null)
      setPreview(null)
      return
    }

    if (maxSize && file.size > maxSize * 1024 * 1024) {
      setError(`El archivo excede el límite de ${maxSize}MB`)
      onChange(null)
      setPreview(null)
      return
    }

    onChange(file)
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result as string)
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
          value
            ? 'border-green-300 bg-green-50/50'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50 bg-muted/30',
          disabled && 'opacity-50 pointer-events-none',
        )}
      >
        {value && preview ? (
          <div className="relative w-full">
            <img
              src={preview}
              alt="Preview"
              className="max-h-48 w-full object-contain rounded-md"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon-sm"
              className="absolute top-1 right-1 size-6"
              onClick={() => { onChange(null); setPreview(null); if (inputRef.current) inputRef.current.value = '' }}
            >
              <X className="size-3" />
            </Button>
          </div>
        ) : value && !preview ? (
          <div className="flex items-center gap-2 text-sm">
            <File className="size-5 text-muted-foreground" />
            <span className="font-medium truncate max-w-[200px]">{value.name}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-6"
              onClick={() => { onChange(null); setPreview(null); if (inputRef.current) inputRef.current.value = '' }}
            >
              <X className="size-3" />
            </Button>
          </div>
        ) : (
          <>
            <Upload className="size-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium">Arrastra una imagen o haz click para subir</p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG, WEBP hasta {maxSize}MB
            </p>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          disabled={disabled}
        />
      </div>

      {error && (
        <p className="text-xs text-destructive font-medium">{error}</p>
      )}
    </div>
  )
}
