'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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

interface Producto {
  id: number
  nombre: string
}

interface Donante {
  id: number
  nombre: string
}

interface Ubicacion {
  id: number
  nombre: string
}

interface Campania {
  id: number
  nombre: string
}

interface Lote {
  id: number
  codigo: string
  cantidad: number
  observaciones: string | null
  productoId: number
  donanteId: number | null
  ubicacionId: number
  campaniaId: number
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  lote?: Lote
}

export function LoteForm({ open, onOpenChange, lote }: Props) {
  const queryClient = useQueryClient()
  const isEditing = !!lote
  const [cantidad, setCantidad] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [productoId, setProductoId] = useState('')
  const [donanteId, setDonanteId] = useState('')
  const [ubicacionId, setUbicacionId] = useState('')
  const [campaniaId, setCampaniaId] = useState('')
  const [error, setError] = useState('')

  const { data: productos = [] } = useQuery<Producto[]>({
    queryKey: ['productos'],
    queryFn: () => api.get('/productos'),
  })

  const { data: donantes = [] } = useQuery<Donante[]>({
    queryKey: ['donantes'],
    queryFn: () => api.get('/donantes'),
  })

  const { data: ubicaciones = [] } = useQuery<Ubicacion[]>({
    queryKey: ['ubicaciones'],
    queryFn: () => api.get('/ubicaciones'),
  })

  const { data: campanias = [] } = useQuery<Campania[]>({
    queryKey: ['campanias'],
    queryFn: () => api.get('/campanias'),
  })

  useEffect(() => {
    if (open) {
      if (isEditing && lote) {
        setCantidad(lote.cantidad.toString())
        setObservaciones(lote.observaciones ?? '')
        setProductoId(lote.productoId.toString())
        setDonanteId(lote.donanteId?.toString() ?? '')
        setUbicacionId(lote.ubicacionId.toString())
        setCampaniaId(lote.campaniaId.toString())
      } else {
        setCantidad('1')
        setObservaciones('')
        setProductoId('')
        setDonanteId('')
        setUbicacionId('')
        setCampaniaId('')
      }
      setError('')
    }
  }, [open, isEditing, lote])

  const mutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      if (isEditing && lote) {
        return api.patch(`/lotes/${lote.id}`, data)
      }
      return api.post('/lotes', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lotes'] })
      onOpenChange(false)
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const cant = parseInt(cantidad, 10)
    if (!cant || cant < 1) { setError('La cantidad debe ser al menos 1'); return }
    if (!productoId) { setError('Selecciona un producto'); return }
    if (!ubicacionId) { setError('Selecciona una ubicación'); return }
    if (!campaniaId) { setError('Selecciona una campaña'); return }

    mutation.mutate({
      cantidad: cant,
      observaciones: observaciones.trim() || undefined,
      productoId: Number(productoId),
      donanteId: donanteId ? Number(donanteId) : undefined,
      ubicacionId: Number(ubicacionId),
      campaniaId: Number(campaniaId),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Lote' : 'Nuevo Lote'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica los datos del lote'
              : 'Ingresa los datos del lote — el código se genera automáticamente'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cantidad">Cantidad</Label>
              <Input
                id="cantidad"
                type="number"
                min="1"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="producto">Producto</Label>
                <Select value={productoId} onValueChange={(v) => setProductoId(v ?? '')}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string | null) => {
                      if (!value) return 'Seleccionar...'
                      const p = productos.find(p => p.id.toString() === value)
                      return p?.nombre ?? value
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {productos.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="donante">Donante</Label>
                <Select value={donanteId} onValueChange={(v) => setDonanteId(v ?? '')}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string | null) => {
                      if (!value) return 'Opcional...'
                      const d = donantes.find(d => d.id.toString() === value)
                      return d?.nombre ?? value
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {donantes.map((d) => (
                    <SelectItem key={d.id} value={d.id.toString()}>
                      {d.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ubicacion">Ubicación</Label>
                <Select value={ubicacionId} onValueChange={(v) => setUbicacionId(v ?? '')}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string | null) => {
                      if (!value) return 'Seleccionar...'
                      const u = ubicaciones.find(u => u.id.toString() === value)
                      return u?.nombre ?? value
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {ubicaciones.map((u) => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      {u.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="campania">Campaña</Label>
                <Select value={campaniaId} onValueChange={(v) => setCampaniaId(v ?? '')}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string | null) => {
                      if (!value) return 'Seleccionar...'
                      const c = campanias.find(c => c.id.toString() === value)
                      return c?.nombre ?? value
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {campanias.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Input
                id="observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Notas opcionales"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 font-medium">{error}</p>
          )}

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancelar
            </DialogClose>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear lote'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
