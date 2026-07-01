'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'

interface Categoria {
  id: number
  nombre: string
  descripcion: string | null
  icono?: string | null
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoria?: Categoria | null
}

export function CategoriaForm({ open, onOpenChange, categoria }: Props) {
  const editando = !!categoria
  const queryClient = useQueryClient()
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setNombre(categoria?.nombre ?? '')
      setDescripcion(categoria?.descripcion ?? '')
      setError('')
    }
  }, [open, categoria])

  const mutation = useMutation({
    mutationFn: (data: { nombre: string; descripcion?: string }) =>
      editando
        ? api.patch(`/categorias/${categoria!.id}`, data)
        : api.post('/categorias', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] })
      onOpenChange(false)
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) {
      setError('El nombre es obligatorio')
      return
    }
    mutation.mutate({ nombre: nombre.trim(), descripcion: descripcion.trim() || undefined })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editando ? 'Editar' : 'Nueva'} Categoría</DialogTitle>
          <DialogDescription>
            {editando ? 'Modifica los datos de la categoría' : 'Registra una nueva categoría de productos'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Alimentos"
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Input
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción opcional"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 font-medium">{error}</p>
          )}

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancelar
            </DialogClose>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending
                ? 'Guardando...'
                : editando
                  ? 'Guardar cambios'
                  : 'Crear categoría'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
