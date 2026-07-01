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

const ESTADOS = [
  { value: 'PLANIFICADA', label: 'Planificada' },
  { value: 'ACTIVA', label: 'Activa' },
  { value: 'PAUSADA', label: 'Pausada' },
  { value: 'FINALIZADA', label: 'Finalizada' },
  { value: 'CANCELADA', label: 'Cancelada' },
]

interface Campania {
  id: number
  nombre: string
  descripcion: string | null
  fechaInicio: string
  fechaFin: string | null
  estado: string
  objetivo: string | null
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  campania?: Campania | null
}

function toDateInput(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  try { return new Date(dateStr).toISOString().slice(0, 10) } catch { return '' }
}

export function CampaniaForm({ open, onOpenChange, campania }: Props) {
  const editando = !!campania
  const queryClient = useQueryClient()
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [estado, setEstado] = useState('PLANIFICADA')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [objetivo, setObjetivo] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setNombre(campania?.nombre ?? '')
      setDescripcion(campania?.descripcion ?? '')
      setEstado(campania?.estado ?? 'PLANIFICADA')
      setFechaInicio(toDateInput(campania?.fechaInicio))
      setFechaFin(toDateInput(campania?.fechaFin))
      setObjetivo(campania?.objetivo ?? '')
      setError('')
    }
  }, [open, campania])

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      editando
        ? api.patch(`/campanias/${campania!.id}`, data)
        : api.post('/campanias', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campanias'] })
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
    mutation.mutate({
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || undefined,
      estado,
      fechaInicio: fechaInicio || undefined,
      fechaFin: fechaFin || undefined,
      objetivo: objetivo.trim() || undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editando ? 'Editar' : 'Nueva'} Campaña</DialogTitle>
          <DialogDescription>
            {editando ? 'Modifica los datos de la campaña' : 'Registra una nueva campaña de donación'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Ayuda Navideña 2026"
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
              placeholder="Descripción de la campaña"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Select value={estado} onValueChange={(v) => setEstado(v ?? 'PLANIFICADA')}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: string | null) => {
                    const e = ESTADOS.find(e => e.value === value)
                    return e?.label ?? value
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ESTADOS.map((e) => (
                  <SelectItem key={e.value} value={e.value}>
                    {e.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaInicio">Fecha de inicio</Label>
              <Input
                id="fechaInicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fechaFin">Fecha de fin</Label>
              <Input
                id="fechaFin"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="objetivo">Objetivo</Label>
            <Input
              id="objetivo"
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              placeholder="Ej: Recolectar 1000 kg de alimentos"
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
                  : 'Crear campaña'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
