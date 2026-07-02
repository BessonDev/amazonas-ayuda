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

const TIPOS_MOVIMIENTO = [
  { value: 'ENTRADA', label: 'Entrada' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
  { value: 'ENVIO', label: 'Envío' },
  { value: 'RECEPCION', label: 'Recepción' },
  { value: 'AJUSTE', label: 'Ajuste' },
]

interface Lote {
  id: number
  codigo: string
}

interface Ubicacion {
  id: number
  nombre: string
}

interface Campania {
  id: number
  nombre: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MovimientoForm({ open, onOpenChange }: Props) {
  const queryClient = useQueryClient()
  const [tipo, setTipo] = useState('ENTRADA')
  const [cantidad, setCantidad] = useState('1')
  const [observaciones, setObservaciones] = useState('')
  const [loteId, setLoteId] = useState('')
  const [ubicacionId, setUbicacionId] = useState('')
  const [campaniaId, setCampaniaId] = useState('')
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
      setTipo('ENTRADA')
      setCantidad('1')
      setObservaciones('')
      setLoteId('')
      setUbicacionId('')
      setCampaniaId('')
      setError('')
    }
  }, [open])

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post('/movimientos', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movimientos'] })
      onOpenChange(false)
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const cant = parseInt(cantidad, 10)
    if (!tipo) { setError('Selecciona un tipo de movimiento'); return }
    if (!cant || cant < 1) { setError('La cantidad debe ser al menos 1'); return }
    if (!loteId) { setError('Selecciona un lote'); return }
    if (!ubicacionId) { setError('Selecciona una ubicación'); return }
    if (!campaniaId) { setError('Selecciona una campaña'); return }

    mutation.mutate({
      tipo,
      cantidad: cant,
      observaciones: observaciones.trim() || undefined,
      loteId: Number(loteId),
      ubicacionId: Number(ubicacionId),
      campaniaId: Number(campaniaId),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo Movimiento</DialogTitle>
          <DialogDescription>
            Registra un movimiento de inventario
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v ?? 'ENTRADA')}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string | null) => {
                      const t = TIPOS_MOVIMIENTO.find(t => t.value === value)
                      return t?.label ?? value
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_MOVIMIENTO.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
              <Label htmlFor="lote">Lote</Label>
              <Select value={loteId} onValueChange={(v) => setLoteId(v ?? '')}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string | null) => {
                      if (!value) return 'Seleccionar lote...'
                      const l = lotes.find(l => l.id.toString() === value)
                      return l?.codigo ?? value
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {lotes.map((l) => (
                    <SelectItem key={l.id} value={l.id.toString()}>
                      {l.codigo}
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
                      if (!value) return 'Seleccionar ubicación...'
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
                      if (!value) return 'Seleccionar campaña...'
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
              {mutation.isPending ? 'Guardando...' : 'Crear movimiento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
