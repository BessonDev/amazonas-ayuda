'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
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

interface Lote {
  id: number
  codigo: string
  producto?: { nombre: string }
}

interface Ubicacion {
  id: number
  nombre: string
}

interface Campania {
  id: number
  nombre: string
}

interface DetalleRow {
  key: string
  loteId: string
  cantidad: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function createRow(): DetalleRow {
  return { key: crypto.randomUUID(), loteId: '', cantidad: '1' }
}

export function ViajeForm({ open, onOpenChange }: Props) {
  const queryClient = useQueryClient()
  const [nombreResponsable, setNombreResponsable] = useState('')
  const [vehiculo, setVehiculo] = useState('')
  const [conductor, setConductor] = useState('')
  const [fechaSalida, setFechaSalida] = useState('')
  const [fechaEstimada, setFechaEstimada] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [campaniaId, setCampaniaId] = useState('')
  const [origenId, setOrigenId] = useState('')
  const [destinoId, setDestinoId] = useState('')
  const [detalles, setDetalles] = useState<DetalleRow[]>([createRow()])
  const [error, setError] = useState('')

  const { data: lotes = [] } = useQuery<Lote[]>({
    queryKey: ['lotes'],
    queryFn: () => api.get('/lotes'),
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
      setNombreResponsable('')
      setVehiculo('')
      setConductor('')
      setFechaSalida('')
      setFechaEstimada('')
      setObservaciones('')
      setCampaniaId('')
      setOrigenId('')
      setDestinoId('')
      setDetalles([createRow()])
      setError('')
    }
  }, [open])

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post('/viajes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viajes'] })
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
    if (!campaniaId) { setError('Selecciona una campaña'); return }
    if (!origenId) { setError('Selecciona el origen'); return }
    if (!destinoId) { setError('Selecciona el destino'); return }

    const detallesData = detalles
      .filter((d) => d.loteId)
      .map((d) => ({
        loteId: Number(d.loteId),
        cantidad: parseInt(d.cantidad, 10) || 1,
      }))

    if (detallesData.length === 0) { setError('Agrega al menos un lote al viaje'); return }

    mutation.mutate({
      nombreResponsable: nombreResponsable.trim() || undefined,
      vehiculo: vehiculo.trim() || undefined,
      conductor: conductor.trim() || undefined,
      fechaSalida: fechaSalida || undefined,
      fechaEstimada: fechaEstimada || undefined,
      observaciones: observaciones.trim() || undefined,
      campaniaId: Number(campaniaId),
      origenId: Number(origenId),
      destinoId: Number(destinoId),
      detalles: detallesData,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Viaje</DialogTitle>
          <DialogDescription>
            Planifica un viaje para transportar lotes entre ubicaciones
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="responsable">Responsable</Label>
              <Input
                id="responsable"
                value={nombreResponsable}
                onChange={(e) => setNombreResponsable(e.target.value)}
                placeholder="Nombre del responsable"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehiculo">Vehículo</Label>
              <Input
                id="vehiculo"
                value={vehiculo}
                onChange={(e) => setVehiculo(e.target.value)}
                placeholder="Ej: Camión Kia"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conductor">Conductor</Label>
              <Input
                id="conductor"
                value={conductor}
                onChange={(e) => setConductor(e.target.value)}
                placeholder="Nombre del conductor"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaSalida">Fecha de salida</Label>
              <Input
                id="fechaSalida"
                type="date"
                value={fechaSalida}
                onChange={(e) => setFechaSalida(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaEstimada">Fecha estimada</Label>
              <Input
                id="fechaEstimada"
                type="date"
                value={fechaEstimada}
                onChange={(e) => setFechaEstimada(e.target.value)}
              />
            </div>

            <div className="space-y-2">
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

            <div className="space-y-2">
              <Label htmlFor="origen">Origen</Label>
              <Select value={origenId} onValueChange={(v) => setOrigenId(v ?? '')}>
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

            <div className="space-y-2">
              <Label htmlFor="destino">Destino</Label>
              <Select value={destinoId} onValueChange={(v) => setDestinoId(v ?? '')}>
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

            <div className="space-y-2 col-span-3">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Input
                id="observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Notas opcionales"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Lotes a transportar</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => setDetalles((p) => [...p, createRow()])}>
                <Plus className="size-4 mr-1" />
                Agregar lote
              </Button>
            </div>

            {detalles.map((d) => (
              <div key={d.key} className="flex gap-3 items-start p-3 border rounded-lg">
                <div className="flex-[2] space-y-2">
                  <Label className="text-xs">Lote</Label>
                  <Select
                    value={d.loteId}
                    onValueChange={(v) => updateDetalle(d.key, 'loteId', v ?? '')}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {(value: string | null) => {
                          if (!value) return 'Seleccionar...'
                          const l = lotes.find(l => l.id.toString() === value)
                          if (!l) return value
                          return `${l.codigo}${l.producto ? ` (${l.producto.nombre})` : ''}`
                        }}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {lotes.map((l) => (
                        <SelectItem key={l.id} value={l.id.toString()}>
                          {l.codigo} {l.producto ? `(${l.producto.nombre})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-24 space-y-2">
                  <Label className="text-xs">Cantidad</Label>
                  <Input
                    type="number"
                    min="1"
                    value={d.cantidad}
                    onChange={(e) => updateDetalle(d.key, 'cantidad', e.target.value)}
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
              {mutation.isPending ? 'Guardando...' : 'Crear viaje'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
