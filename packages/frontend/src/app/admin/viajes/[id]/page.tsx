'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Truck, Calendar, User, MapPin, Pencil } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { formatEstadoViaje } from '@/lib/enums'
import { CambiarEstadoDialog } from '../cambiar-estado-dialog'
import { ViajeForm } from '../viaje-form'
import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'

interface ViajeDetalle {
  id: number
  codigo: string
  nombreResponsable: string | null
  vehiculo: string | null
  conductor: string | null
  fechaSalida: string | null
  fechaEstimada: string | null
  fechaLlegada: string | null
  observaciones: string | null
  estado: string
  campania?: { nombre: string }
  origen?: { nombre: string }
  destino?: { nombre: string }
  detalles?: Array<{
    id: number
    cantidad: number
    lote: {
      codigo: string
      cantidad: number
      estado: string
      producto?: { nombre: string }
      donante?: { nombre: string }
    }
  }>
}

const estadoVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PLANIFICADO: 'secondary',
  EN_TRANSITO: 'default',
  RECEPCION_PARCIAL: 'outline',
  COMPLETADO: 'default',
  CANCELADO: 'destructive',
}

export default function ViajeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { usuario } = useAuth()
  const [estadoDialogOpen, setEstadstateDialogOpen] = useState(false)
  const [editFormOpen, setEditFormOpen] = useState(false)

  const puedeCambiarEstado = usuario?.rol === 'ADMINISTRADOR' || usuario?.rol === 'COORDINADOR_LOGISTICO'

  const { data: viaje, isLoading } = useQuery<ViajeDetalle>({
    queryKey: ['viaje', params.id],
    queryFn: () => api.get(`/viajes/${params.id}`),
    enabled: !!params.id,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    )
  }

  if (!viaje) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Viaje no encontrado</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/admin/viajes')}>
          Volver
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon-sm" onClick={() => router.push('/admin/viajes')}>
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight font-mono">{viaje.codigo}</h1>
          <p className="text-muted-foreground text-sm">Detalle del viaje</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={estadoVariants[viaje.estado] ?? 'outline'} className="text-sm px-3 py-1">
            {formatEstadoViaje(viaje.estado)}
          </Badge>
          {puedeCambiarEstado && (
            <>
              <Button onClick={() => setEstadstateDialogOpen(true)}>
                <Truck className="size-4 mr-2" />
                Cambiar estado
              </Button>
              <Button variant="outline" onClick={() => setEditFormOpen(true)}>
                <Pencil className="size-4 mr-2" />
                Editar viaje
              </Button>
            </>
          )}
        </div>
      </div>

      <CambiarEstadoDialog
        viaje={{ id: viaje.id, codigo: viaje.codigo, estado: viaje.estado }}
        open={estadoDialogOpen}
        onOpenChange={(open) => { if (!open) setEstadstateDialogOpen(false) }}
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <User className="size-4" />
              Responsable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{viaje.nombreResponsable ?? '—'}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Conductor: {viaje.conductor ?? '—'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Truck className="size-4" />
              Vehículo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{viaje.vehiculo ?? '—'}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Campaña: {viaje.campania?.nombre ?? '—'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="size-4" />
              Fechas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Salida: <span className="font-semibold">{viaje.fechaSalida ? new Date(viaje.fechaSalida).toLocaleDateString() : '—'}</span>
            </p>
            <p className="text-sm mt-1">
              Estimada: <span className="font-semibold">{viaje.fechaEstimada ? new Date(viaje.fechaEstimada).toLocaleDateString() : '—'}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MapPin className="size-4" />
            Ruta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-lg">
            <Badge variant="secondary" className="text-sm px-3 py-1.5">
              {viaje.origen?.nombre ?? '?'}
            </Badge>
            <ArrowRight className="size-5 text-muted-foreground" />
            <Badge variant="secondary" className="text-sm px-3 py-1.5">
              {viaje.destino?.nombre ?? '?'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {viaje.observaciones && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Observaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap text-muted-foreground">{viaje.observaciones}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            Lotes ({viaje.detalles?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!viaje.detalles || viaje.detalles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No hay lotes asignados a este viaje
            </div>
          ) : (
            <div className="divide-y">
              {viaje.detalles.map((det) => (
                <div key={det.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="font-mono text-sm font-medium">{det.lote.codigo}</p>
                    <p className="text-xs text-muted-foreground">
                      {det.lote.producto?.nombre ?? '—'} | Donante: {det.lote.donante?.nombre ?? '—'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{det.cantidad} und</p>
                    <Badge variant="outline" className="text-xs">
                      {det.lote.estado}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ViajeForm
        open={editFormOpen}
        onOpenChange={setEditFormOpen}
        viaje={viaje}
      />
      </div>
  )
}
