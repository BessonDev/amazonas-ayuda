'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'
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

const PRIORIDADES = [
  { value: 'BAJA', label: 'Baja' },
  { value: 'MEDIA', label: 'Media' },
  { value: 'ALTA', label: 'Alta' },
  { value: 'URGENTE', label: 'Urgente' },
]

interface Producto {
  id: number
  nombre: string
}

interface Campania {
  id: number
  nombre: string
}

interface Ubicacion {
  id: number
  nombre: string
  campaniaId: number
}

interface DetalleRow {
  key: string
  productoId: string
  meta: string
  descripcion: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function createRow(): DetalleRow {
  return { key: crypto.randomUUID(), productoId: '', meta: '1', descripcion: '' }
}

export function SolicitudForm({ open, onOpenChange }: Props) {
  const queryClient = useQueryClient()
  const { usuario } = useAuth()
  const esReceptor = usuario?.rol === 'RESPONSABLE_DESTINO'
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [prioridad, setPrioridad] = useState('MEDIA')
  const [campaniaId, setCampaniaId] = useState('')
  const [ubicacionId, setUbicacionId] = useState('')
  const [detalles, setDetalles] = useState<DetalleRow[]>([createRow()])
  const [error, setError] = useState('')

  const { data: productos = [] } = useQuery<Producto[]>({
    queryKey: ['productos'],
    queryFn: () => api.get('/productos'),
  })

  const { data: campanias = [] } = useQuery<Campania[]>({
    queryKey: ['campanias'],
    queryFn: () => api.get('/campanias'),
  })

  const { data: ubicaciones = [] } = useQuery<Ubicacion[]>({
    queryKey: ['ubicaciones'],
    queryFn: () => api.get('/ubicaciones'),
  })

  useEffect(() => {
    if (open) {
      setTitulo('')
      setDescripcion('')
      setPrioridad('MEDIA')
      setDetalles([createRow()])
      setError('')

      if (esReceptor && usuario?.ubicacionId) {
        setUbicacionId(usuario.ubicacionId.toString())
        const miUbicacion = ubicaciones.find((u) => u.id === usuario.ubicacionId)
        if (miUbicacion) {
          setCampaniaId(miUbicacion.campaniaId.toString())
        }
      } else {
        setCampaniaId('')
        setUbicacionId('')
      }
    }
  }, [open, esReceptor, usuario?.ubicacionId, ubicaciones])

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post('/solicitudes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitudes'] })
      onOpenChange(false)
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  const updateDetalle = (key: string, field: keyof DetalleRow, value: string) => {
    setDetalles((prev) =>
      prev.map((d) => (d.key === key ? { ...d, [field]: value } : d))
    )
  }

  const removeDetalle = (key: string) => {
    setDetalles((prev) => prev.filter((d) => d.key !== key))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!titulo.trim()) { setError('El título es obligatorio'); return }
    if (!esReceptor && !campaniaId) { setError('Selecciona una campaña'); return }
    if (!esReceptor && !ubicacionId) { setError('Selecciona una ubicación'); return }

    const detallesData = detalles
      .filter((d) => d.productoId)
      .map((d) => ({
        productoId: Number(d.productoId),
        meta: parseInt(d.meta, 10) || 1,
        descripcion: d.descripcion.trim() || undefined,
      }))

    if (detallesData.length === 0) { setError('Agrega al menos un producto'); return }

    mutation.mutate({
      titulo: titulo.trim(),
      descripcion: descripcion.trim() || undefined,
      prioridad,
      campaniaId: Number(campaniaId),
      ubicacionId: Number(ubicacionId),
      detalles: detallesData,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Solicitud</DialogTitle>
          <DialogDescription>
            Crea una solicitud de recursos con los productos necesarios
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej: Solicitud de alimentos para campaña"
                required
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Input
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Detalles adicionales (opcional)"
              />
            </div>

            {!esReceptor && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="prioridad">Prioridad</Label>
                  <Select value={prioridad} onValueChange={(v) => setPrioridad(v ?? 'MEDIA')}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORIDADES.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="campania">Campaña</Label>
                  <Select value={campaniaId} onValueChange={(v) => setCampaniaId(v ?? '')}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar campaña..." />
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
                  <Label htmlFor="ubicacion">Ubicación</Label>
                  <Select value={ubicacionId} onValueChange={(v) => setUbicacionId(v ?? '')}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar ubicación..." />
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
              </>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Productos solicitados</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => setDetalles((p) => [...p, createRow()])}>
                <Plus className="size-4 mr-1" />
                Agregar producto
              </Button>
            </div>

            {detalles.map((d, i) => (
              <div key={d.key} className="flex gap-3 items-start p-3 border rounded-lg">
                <div className="flex-1 space-y-2">
                  <Label className="text-xs">Producto</Label>
                  <Select
                    value={d.productoId}
                    onValueChange={(v) => updateDetalle(d.key, 'productoId', v ?? '')}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar..." />
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

                <div className="w-24 space-y-2">
                  <Label className="text-xs">Meta</Label>
                  <Input
                    type="number"
                    min="1"
                    value={d.meta}
                    onChange={(e) => updateDetalle(d.key, 'meta', e.target.value)}
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <Label className="text-xs">Descripción</Label>
                  <Input
                    value={d.descripcion}
                    onChange={(e) => updateDetalle(d.key, 'descripcion', e.target.value)}
                    placeholder="Opcional"
                  />
                </div>

                {detalles.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="mt-6 shrink-0"
                    onClick={() => removeDetalle(d.key)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {error && (
            <p className="text-sm text-red-600 font-medium">{error}</p>
          )}

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancelar
            </DialogClose>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Guardando...' : 'Crear solicitud'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
