'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Package, Image } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { FileUpload } from '@/components/ui/file-upload'
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
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatEstadoLote } from '@/lib/enums'

interface LoteItem {
  id: number
  codigo: string
  cantidad: number
  estado: string
  donante: string | null
  fecha: string
}

interface GrupoProducto {
  producto: { id: number; nombre: string; categoria?: { nombre: string } }
  total: number
  lotes: LoteItem[]
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
  loteCodigo: string
  productoNombre: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function createRow(lote?: { id: number; codigo: string; productoNombre: string }): DetalleRow {
  return {
    key: crypto.randomUUID(),
    loteId: lote ? lote.id.toString() : '',
    cantidad: '',
    loteCodigo: lote?.codigo ?? '',
    productoNombre: lote?.productoNombre ?? '',
  }
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
  const [detalles, setDetalles] = useState<DetalleRow[]>([])
  const [error, setError] = useState('')
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [cantidadPorLote, setCantidadPorLote] = useState<Record<number, string>>({})

  const { data: ubicaciones = [] } = useQuery<Ubicacion[]>({
    queryKey: ['ubicaciones'],
    queryFn: () => api.get('/ubicaciones'),
  })

  const { data: campanias = [] } = useQuery<Campania[]>({
    queryKey: ['campanias'],
    queryFn: () => api.get('/campanias'),
  })

  const { data: grupos = [] } = useQuery<GrupoProducto[]>({
    queryKey: ['lotes-disponibles', origenId],
    queryFn: () => api.get(`/viajes/lotes-disponibles?origenId=${origenId}`),
    enabled: !!origenId,
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
      setDetalles([])
      setCantidadPorLote({})
      setError('')
      setFotoFile(null)
    }
  }, [open])

  const uploadFoto = async (viajeId: number) => {
    if (!fotoFile) return
    const formData = new FormData()
    formData.append('archivo', fotoFile)
    formData.append('nombre', fotoFile.name)
    formData.append('entidadTipo', 'Viaje')
    formData.append('entidadId', String(viajeId))
    formData.append('viajeId', String(viajeId))
    await api.postForm('/archivos/upload', formData)
  }

  interface ViajeResponse {
    id: number
    [key: string]: unknown
  }

  const mutation = useMutation<ViajeResponse, Error, Record<string, unknown>>({
    mutationFn: (data) =>
      api.post<ViajeResponse>('/viajes', data),
    onSuccess: async (viaje: ViajeResponse) => {
      queryClient.invalidateQueries({ queryKey: ['viajes'] })
      queryClient.invalidateQueries({ queryKey: ['lotes-disponibles'] })
      if (fotoFile) {
        await uploadFoto(viaje.id)
      }
      onOpenChange(false)
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  const agregarLote = (lote: LoteItem) => {
    const cantidad = parseInt(cantidadPorLote[lote.id] ?? '1', 10) || 1
    if (isNaN(cantidad) || cantidad <= 0) return
    if (cantidad > lote.cantidad) {
      setError(`La cantidad máxima para ${lote.codigo} es ${lote.cantidad}`)
      return
    }

    const producto = grupos.flatMap(g => g.lotes).find(l => l.id === lote.id)
    const productoNombre = grupos.find(g => g.lotes.some(l => l.id === lote.id))?.producto.nombre ?? ''
    setDetalles(prev => [...prev, createRow({ id: lote.id, codigo: lote.codigo, productoNombre })])
    setDetalles(prev => {
      const existing = prev.find(d => d.loteId === lote.id.toString())
      if (existing) {
        const newCant = (parseInt(existing.cantidad, 10) || 0) + cantidad
        return prev.map(d => d.key === existing.key ? { ...d, cantidad: newCant.toString() } : d)
      }
      const newRow = createRow({ id: lote.id, codigo: lote.codigo, productoNombre })
      return [...prev, { ...newRow, cantidad: cantidad.toString() }]
    })
    setCantidadPorLote(prev => ({ ...prev, [lote.id]: '' }))
  }

  const removeDetalle = (key: string) => {
    setDetalles(prev => prev.filter(d => d.key !== key))
  }

  const updateDetalleCantidad = (key: string, cantidad: string) => {
    setDetalles(prev => prev.map(d => d.key === key ? { ...d, cantidad } : d))
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
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
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
              <Select value={origenId} onValueChange={(v) => { setOrigenId(v ?? ''); setDetalles([]) }}>
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
          </div>

          <Separator />

          {/* Lotes disponibles consolidados por producto */}
          {origenId && (
            <div className="space-y-3">
              <Label className="text-base font-medium">Lotes disponibles en origen</Label>

              {grupos.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay lotes disponibles en esta ubicación</p>
              ) : (
                <div className="space-y-4">
                  {grupos.map((grupo) => (
                    <div key={grupo.producto.id} className="border rounded-lg overflow-hidden">
                      <div className="bg-muted/50 px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="size-4 text-muted-foreground" />
                          <span className="font-semibold text-sm">{grupo.producto.nombre}</span>
                          {grupo.producto.categoria && (
                            <Badge variant="outline" className="text-xs">{grupo.producto.categoria.nombre}</Badge>
                          )}
                        </div>
                        <span className="text-sm font-medium">{grupo.total} und disponibles</span>
                      </div>

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Lote</TableHead>
                            <TableHead className="text-xs">Cant.</TableHead>
                            <TableHead className="text-xs">Donante</TableHead>
                            <TableHead className="text-xs">Estado</TableHead>
                            <TableHead className="text-xs w-28">Enviar</TableHead>
                            <TableHead className="w-20"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {grupo.lotes.map((lote) => (
                            <TableRow key={lote.id}>
                              <TableCell className="font-mono text-xs">{lote.codigo}</TableCell>
                              <TableCell className="text-xs">{lote.cantidad}</TableCell>
                              <TableCell className="text-xs">{lote.donante ?? '—'}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {formatEstadoLote(lote.estado)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="1"
                                  max={lote.cantidad}
                                  placeholder="Cant."
                                  className="h-8 text-xs"
                                  value={cantidadPorLote[lote.id] ?? ''}
                                  onChange={(e) => setCantidadPorLote(prev => ({ ...prev, [lote.id]: e.target.value }))}
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-xs"
                                  disabled={!cantidadPorLote[lote.id] || parseInt(cantidadPorLote[lote.id] ?? '0', 10) <= 0}
                                  onClick={() => agregarLote(lote)}
                                >
                                  <Plus className="size-3 mr-1" />
                                  Agregar
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Lotes seleccionados */}
          {detalles.length > 0 && (
            <div className="space-y-2">
              <Label className="text-base font-medium">Lotes seleccionados ({detalles.length})</Label>
              <div className="space-y-2">
                {detalles.map((d) => (
                  <div key={d.key} className="flex items-center gap-3 p-2.5 border rounded-lg">
                    <Package className="size-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm font-medium truncate">{d.loteCodigo}</p>
                      <p className="text-xs text-muted-foreground truncate">{d.productoNombre}</p>
                    </div>
                    <div className="w-20">
                      <Input
                        type="number"
                        min="1"
                        value={d.cantidad}
                        className="h-8 text-xs text-center"
                        onChange={(e) => updateDetalleCantidad(d.key, e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="shrink-0"
                      onClick={() => removeDetalle(d.key)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2 border-t pt-4">
            <Label className="flex items-center gap-2 text-base font-medium">
              <Image className="size-4.5 text-[#1B4332]" />
              Foto del viaje (opcional)
            </Label>
            <FileUpload
              accept="image/*"
              maxSize={10}
              value={fotoFile}
              onChange={setFotoFile}
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
              {mutation.isPending ? 'Guardando...' : 'Crear viaje'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
