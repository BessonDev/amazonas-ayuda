'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

const TIPOS_DONANTE = [
  { value: 'ANONIMO', label: 'Anónimo' },
  { value: 'PERSONA', label: 'Persona Natural' },
  { value: 'EMPRESA', label: 'Empresa' },
  { value: 'IGLESIA', label: 'Iglesia' },
  { value: 'FUNDACION', label: 'Fundación' },
]

interface Donante {
  id: number
  tipo: string | null
  nombre: string | null
  telefono: string | null
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  donante?: Donante | null
}

export function DonanteForm({ open, onOpenChange, donante }: Props) {
  const editando = !!donante
  const queryClient = useQueryClient()
  const [tipo, setTipo] = useState('ANONIMO')
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [error, setError] = useState('')
  const esAnonimo = tipo === 'ANONIMO'

  useEffect(() => {
    if (open) {
      setTipo(donante?.tipo ?? 'ANONIMO')
      setNombre(donante?.nombre ?? '')
      setTelefono(donante?.telefono ?? '')
      setError('')
    }
  }, [open, donante])

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      editando
        ? api.patch(`/donantes/${donante!.id}`, data)
        : api.post('/donantes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donantes'] })
      toast.success(editando ? 'Donante actualizado' : 'Donante creado')
      onOpenChange(false)
    },
    onError: (err: Error) => {
      setError(err.message)
      toast.error(err.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!esAnonimo && !nombre.trim()) {
      setError('El nombre es obligatorio para este tipo de donante')
      return
    }
    mutation.mutate({
      tipo,
      nombre: esAnonimo ? undefined : nombre.trim() || undefined,
      telefono: telefono.trim() || undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editando ? 'Editar' : 'Nuevo'} Donante</DialogTitle>
          <DialogDescription>
            {editando ? 'Modifica los datos del donante' : 'Registra un nuevo donante'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de donante</Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v ?? 'ANONIMO')}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: string | null) => {
                    const t = TIPOS_DONANTE.find(t => t.value === value)
                    return t?.label ?? value
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {TIPOS_DONANTE.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombre">
              Nombre / Razón Social
              {!esAnonimo && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder={esAnonimo ? 'Opcional para donantes anónimos' : 'Nombre del donante'}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Número de contacto (opcional)"
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
                  : 'Crear donante'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
