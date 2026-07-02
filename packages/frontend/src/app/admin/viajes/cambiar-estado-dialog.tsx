'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
import { api } from '@/lib/api'
import { formatEstadoViaje } from '@/lib/enums'
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Viaje {
  id: number
  codigo: string
  estado: string
}

const TRANSICIONES: Record<string, string[]> = {
  PLANIFICADO: ['PREPARANDO_CARGA', 'CANCELADO'],
  PREPARANDO_CARGA: ['EN_TRANSITO', 'PLANIFICADO', 'CANCELADO'],
  EN_TRANSITO: ['LLEGO', 'CANCELADO'],
  LLEGO: ['COMPLETADO', 'RECEPCION_PARCIAL', 'EN_TRANSITO'],
  COMPLETADO: [],
  RECEPCION_PARCIAL: ['COMPLETADO'],
  CANCELADO: [],
}

interface CambiarEstadoDialogProps {
  viaje: Viaje | null
  onOpenChange: (open: boolean) => void
}

export function CambiarEstadoDialog({ viaje, onOpenChange }: CambiarEstadoDialogProps) {
  const [selectedEstado, setSelectedEstado] = useState<string | null>(null)
  const [observaciones, setObservaciones] = useState('')
  const queryClient = useQueryClient()

  const open = viaje !== null

  const mutation = useMutation({
    mutationFn: ({ id, estado, observaciones }: { id: number; estado: string; observaciones?: string }) =>
      api.patch(`/viajes/${id}/estado`, { estado, observaciones }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viajes'] })
      queryClient.invalidateQueries({ queryKey: ['viaje'] })
      setSelectedEstado(null)
      setObservaciones('')
      onOpenChange(false)
    },
  })

  if (!viaje) return null

  const opciones = TRANSICIONES[viaje.estado] ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cambiar estado de viaje</DialogTitle>
          <DialogDescription>
            Viaje <span className="font-mono font-semibold">{viaje.codigo}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Estado actual</Label>
            <div className="mt-1">
              <Badge variant="secondary">{formatEstadoViaje(viaje.estado)}</Badge>
            </div>
          </div>

          {opciones.length === 0 ? (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>
                Este viaje no puede cambiar de estado desde &ldquo;{formatEstadoViaje(viaje.estado)}&rdquo;
              </AlertDescription>
            </Alert>
          ) : (
            <div>
              <Label>Nuevo estado</Label>
              <div className="mt-1 flex flex-wrap gap-2">
                {opciones.map((est) => {
                  const isSelected = selectedEstado === est
                  const variant = isSelected ? 'default' : 'outline'
                  return (
                    <Badge
                      key={est}
                      variant={variant}
                      className="cursor-pointer hover:opacity-80 transition-all"
                      onClick={() => setSelectedEstado(est)}
                    >
                      {formatEstadoViaje(est)}
                    </Badge>
                  )
                })}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="obs">Observaciones (opcional)</Label>
            <Textarea
              id="obs"
              placeholder="Motivo del cambio..."
              className="mt-1"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            disabled={!selectedEstado || mutation.isPending}
            onClick={() => {
              if (selectedEstado) {
                mutation.mutate({ id: viaje.id, estado: selectedEstado, observaciones: observaciones || undefined })
              }
            }}
          >
            {mutation.isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
            <ArrowRight className="size-4 mr-2" />
            Cambiar a {selectedEstado ? formatEstadoViaje(selectedEstado) : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
