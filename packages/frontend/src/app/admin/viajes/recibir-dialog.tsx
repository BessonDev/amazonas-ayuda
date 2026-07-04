'use client'

import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import {
  Loader2,
  CheckCircle2,
  ArrowRight,
  CircleDot,
  MinusCircle,
} from 'lucide-react'
import { FileUpload } from '@/components/ui/file-upload'

type EstadoLote = 'completo' | 'parcial' | 'no_recibido'

interface Viaje {
  id: number
  codigo: string
  estado: string
}

interface ViajeDetalle {
  id: number
  codigo: string
  detalles?: Array<{
    id: number
    cantidad: number
    lote: {
      id: number
      codigo: string
      cantidad: number
      producto?: { nombre: string }
      donante?: { nombre: string }
    }
  }>
}

interface RecibirDialogProps {
  viaje: Viaje | null
  onOpenChange: (open: boolean) => void
}

const ESTADOS: {
  key: EstadoLote
  label: string
  icon: typeof CircleDot
  color: string
  bg: string
}[] = [
  {
    key: 'completo',
    label: 'Completo',
    icon: CheckCircle2,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 data-[active=true]:bg-emerald-100 data-[active=true]:ring-emerald-500',
  },
  {
    key: 'parcial',
    label: 'Parcial',
    icon: CircleDot,
    color: 'text-amber-600',
    bg: 'bg-amber-50 data-[active=true]:bg-amber-100 data-[active=true]:ring-amber-500',
  },
  {
    key: 'no_recibido',
    label: 'No recibido',
    icon: MinusCircle,
    color: 'text-red-600',
    bg: 'bg-red-50 data-[active=true]:bg-red-100 data-[active=true]:ring-red-500',
  },
]

const ESTADO_BADGE: Record<
  EstadoLote,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  completo: { label: 'Completo', variant: 'default' },
  parcial: { label: 'Parcial', variant: 'secondary' },
  no_recibido: { label: 'No recibido', variant: 'destructive' },
}

export function RecibirDialog({ viaje, onOpenChange }: RecibirDialogProps) {
  const [observaciones, setObservaciones] = useState('')
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const queryClient = useQueryClient()
  const open = viaje !== null

  const { data: detalle, isLoading: cargando } = useQuery<ViajeDetalle>({
    queryKey: ['viaje', viaje?.id],
    queryFn: () => api.get(`/viajes/${viaje!.id}`),
    enabled: open,
  })

  const [cantidades, setCantidades] = useState<
    Record<number, { recibida: number; danada: number }>
  >({})

  const [estados, setEstados] = useState<Record<number, EstadoLote>>({})

  useEffect(() => {
    if (detalle?.detalles) {
      const initC: Record<number, { recibida: number; danada: number }> = {}
      const initE: Record<number, EstadoLote> = {}
      for (const d of detalle.detalles) {
        initC[d.lote.id] = { recibida: d.cantidad, danada: 0 }
        initE[d.lote.id] = 'completo'
      }
      setCantidades(initC)
      setEstados(initE)
    }
  }, [detalle])

  const cambiarEstado = (loteId: number, estado: EstadoLote, enviado: number) => {
    setEstados((prev) => ({ ...prev, [loteId]: estado }))
    if (estado === 'completo') {
      setCantidades((prev) => ({ ...prev, [loteId]: { recibida: enviado, danada: 0 } }))
    } else if (estado === 'no_recibido') {
      setCantidades((prev) => ({ ...prev, [loteId]: { recibida: 0, danada: 0 } }))
    }
  }

  const resumen = useMemo(() => {
    const values = Object.values(estados)
    if (values.length === 0) return null
    const completos = values.filter((e) => e === 'completo').length
    const parciales = values.filter((e) => e === 'parcial').length
    const noRecibidos = values.filter((e) => e === 'no_recibido').length
    return { completos, parciales, noRecibidos, total: values.length }
  }, [estados])

  const mutation = useMutation({
    mutationFn: async () => {
      let fotoRecepcionUrl: string | undefined

      if (fotoFile) {
        const formData = new FormData()
        formData.append('archivo', fotoFile)
        formData.append('nombre', `recepcion-viaje-${viaje!.codigo}`)
        formData.append('entidadTipo', 'Viaje')
        formData.append('entidadId', String(viaje!.id))
        formData.append('viajeId', String(viaje!.id))
        const archivo = await api.postForm<{ id: number }>('/archivos/upload', formData)
        fotoRecepcionUrl = `/api/archivos/${archivo.id}/descargar`
      }

      const detallesRecepcion = Object.entries(cantidades).map(
        ([loteId, q]) => ({
          loteId: Number(loteId),
          cantidadRecibida: q.recibida,
          cantidadDanada: q.danada,
        }),
      )

      return api.post(`/viajes/${viaje!.id}/recibir`, {
        detallesRecepcion,
        observaciones: observaciones || undefined,
        fotoRecepcionUrl,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viajes'] })
      queryClient.invalidateQueries({ queryKey: ['viaje', viaje?.id] })
      toast.success(`Viaje ${viaje!.codigo} recibido correctamente`)
      setObservaciones('')
      setFotoFile(null)
      setCantidades({})
      setEstados({})
      onOpenChange(false)
    },
    onError: (err) => {
      toast.error(
        `Error al recibir el viaje: ${err instanceof Error ? err.message : 'desconocido'}`,
      )
    },
  })

  if (!viaje) return null

  const lotes = detalle?.detalles ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-emerald-500" />
            Recibir viaje
          </DialogTitle>
          <DialogDescription>
            Viaje{' '}
            <span className="font-mono font-semibold">{viaje.codigo}</span>
            {resumen && (
              <span className="ml-2 text-xs text-muted-foreground">
                · {resumen.total} lote{resumen.total !== 1 ? 's' : ''}
                {resumen.completos > 0 && (
                  <span className="ml-1 text-emerald-600 font-medium">
                    ({resumen.completos} completo{resumen.completos !== 1 ? 's' : ''}
                  </span>
                )}
                {resumen.parciales > 0 && (
                  <span className="ml-1 text-amber-600 font-medium">
                    , {resumen.parciales} parcial
                  </span>
                )}
                {resumen.noRecibidos > 0 && (
                  <span className="ml-1 text-red-600 font-medium">
                    , {resumen.noRecibidos} no recibido{resumen.noRecibidos !== 1 ? 's' : ''}
                  </span>
                )}
                {resumen.completos > 0 && <span>)</span>}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {cargando ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <Label>Lotes a recibir</Label>
              <div className="mt-2 space-y-3">
                {lotes.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    Este viaje no tiene lotes asignados
                  </p>
                ) : (
                  lotes.map((det) => {
                    const c =
                      cantidades[det.lote.id] ?? {
                        recibida: det.cantidad,
                        danada: 0,
                      }
                    const estado =
                      estados[det.lote.id] ?? 'completo'
                    const restante =
                      det.cantidad - c.recibida - c.danada
                    const badge = ESTADO_BADGE[estado]

                    const actualizar = (
                      campo: 'recibida' | 'danada',
                      valor: number,
                    ) => {
                      const clamped = Math.max(
                        0,
                        Math.min(
                          valor,
                          campo === 'recibida'
                            ? det.cantidad - c.danada
                            : det.cantidad - c.recibida,
                        ),
                      )
                      setCantidades((prev) => ({
                        ...prev,
                        [det.lote.id]: {
                          ...prev[det.lote.id],
                          [campo]: clamped,
                        },
                      }))
                      if (det.cantidad - clamped - (campo === 'recibida' ? c.danada : c.recibida) > 0) {
                        setEstados((prev) => ({ ...prev, [det.lote.id]: 'parcial' }))
                      }
                    }

                    const IconEstado =
                      ESTADOS.find((e) => e.key === estado)?.icon ?? CheckCircle2

                    return (
                      <div
                        key={det.id}
                        className="rounded-lg border px-3 py-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <IconEstado className="size-4 shrink-0 text-muted-foreground" />
                              <p className="text-sm font-medium truncate">
                                {det.lote.codigo}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground truncate ml-6">
                              {det.lote.producto?.nombre ?? '—'} ·{' '}
                              {det.lote.donante?.nombre ?? '—'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant="outline" className="text-xs">
                              {det.cantidad} und
                            </Badge>
                            <Badge variant={badge.variant} className="text-xs">
                              {badge.label}
                            </Badge>
                          </div>
                        </div>

                        <div className="mt-2 flex items-center gap-1">
                          {ESTADOS.map((opt) => {
                            const Icon = opt.icon
                            const active = estado === opt.key
                            return (
                              <button
                                key={opt.key}
                                type="button"
                                data-active={active}
                                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-xs font-medium ring-1 ring-inset transition-all cursor-pointer
                                  ${active ? `${opt.color} ${opt.bg}` : 'text-muted-foreground border-transparent hover:bg-muted/50'}
                                `}
                                onClick={() =>
                                  cambiarEstado(det.lote.id, opt.key, det.cantidad)
                                }
                              >
                                <Icon className="size-3.5" />
                                {opt.label}
                              </button>
                            )
                          })}
                        </div>

                        {estado === 'parcial' && (
                          <div className="mt-2 flex items-center gap-3">
                            <div className="flex-1">
                              <Label className="text-xs text-muted-foreground">
                                Buen estado
                              </Label>
                              <Input
                                type="number"
                                min={0}
                                max={det.cantidad - c.danada}
                                value={c.recibida}
                                onChange={(e) =>
                                  actualizar(
                                    'recibida',
                                    parseInt(e.target.value) || 0,
                                  )
                                }
                                className="h-8 text-sm mt-0.5"
                              />
                            </div>
                            <div className="flex-1">
                              <Label className="text-xs text-muted-foreground">
                                Dañado
                              </Label>
                              <Input
                                type="number"
                                min={0}
                                max={det.cantidad - c.recibida}
                                value={c.danada}
                                onChange={(e) =>
                                  actualizar(
                                    'danada',
                                    parseInt(e.target.value) || 0,
                                  )
                                }
                                className="h-8 text-sm mt-0.5"
                              />
                            </div>
                            <div className="flex-1">
                              <Label className="text-xs text-muted-foreground">
                                Faltante
                              </Label>
                              <div className="h-8 flex items-center text-sm font-medium text-amber-600 mt-0.5">
                                {restante > 0 ? restante : '—'}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            <Separator />

            <div>
              <Label>Foto de recepción (opcional)</Label>
              <div className="mt-1">
                <FileUpload
                  value={fotoFile}
                  onChange={setFotoFile}
                  accept="image/*"
                  maxSize={10}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="obs-recibir">
                Observaciones (opcional)
              </Label>
              <Textarea
                id="obs-recibir"
                placeholder="Notas sobre la recepción..."
                className="mt-1"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              />
            </div>
          </div>
        )}

        <DialogFooter className="flex items-center justify-between gap-4">
          <div className="text-xs text-muted-foreground">
            {resumen && resumen.parciales + resumen.noRecibidos > 0
              ? 'El viaje quedará como RECEPCIÓN_PARCIAL'
              : 'Todos los lotes completos → COMPLETADO'}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              disabled={
                lotes.length === 0 || mutation.isPending || cargando
              }
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending && (
                <Loader2 className="size-4 mr-2 animate-spin" />
              )}
              <ArrowRight className="size-4 mr-2" />
              Confirmar recepción
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
