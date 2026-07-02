'use client'

import { useState } from 'react'
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
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Loader2, CheckCircle2, ArrowRight } from 'lucide-react'

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

export function RecibirDialog({ viaje, onOpenChange }: RecibirDialogProps) {
  const [observaciones, setObservaciones] = useState('')
  const queryClient = useQueryClient()
  const open = viaje !== null

  const { data: detalle, isLoading: cargando } = useQuery<ViajeDetalle>({
    queryKey: ['viaje', viaje?.id],
    queryFn: () => api.get(`/viajes/${viaje!.id}`),
    enabled: open,
  })

  const mutation = useMutation({
    mutationFn: () =>
      api.post(`/viajes/${viaje!.id}/recibir`, {
        detallesRecepcion: detalle?.detalles?.map((d) => ({
          loteId: d.lote.id,
          cantidadRecibida: d.cantidad,
          cantidadDanada: 0,
        })) ?? [],
        observaciones: observaciones || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viajes'] })
      queryClient.invalidateQueries({ queryKey: ['viaje', viaje?.id] })
      toast.success(`Viaje ${viaje!.codigo} recibido correctamente`)
      setObservaciones('')
      onOpenChange(false)
    },
    onError: () => {
      toast.error('Error al recibir el viaje')
    },
  })

  if (!viaje) return null

  const lotes = detalle?.detalles ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-emerald-500" />
            Recibir viaje
          </DialogTitle>
          <DialogDescription>
            Viaje <span className="font-mono font-semibold">{viaje.codigo}</span> &mdash; todos los lotes se marcarán como recibidos en buen estado
          </DialogDescription>
        </DialogHeader>

        {cargando ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Lotes a recibir</Label>
              <div className="mt-2 space-y-2">
                {lotes.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    Este viaje no tiene lotes asignados
                  </p>
                ) : (
                  lotes.map((det) => (
                    <div
                      key={det.id}
                      className="flex items-center justify-between rounded-lg border px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{det.lote.codigo}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {det.lote.producto?.nombre ?? '—'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className="text-xs">
                          {det.cantidad} und
                        </Badge>
                        <CheckCircle2 className="size-4 text-emerald-500" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <Separator />

            <div>
              <Label htmlFor="obs-recibir">Observaciones (opcional)</Label>
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

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            disabled={lotes.length === 0 || mutation.isPending || cargando}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
            <ArrowRight className="size-4 mr-2" />
            Confirmar recepción
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
