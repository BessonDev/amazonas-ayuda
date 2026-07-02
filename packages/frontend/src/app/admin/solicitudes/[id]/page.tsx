'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, Calendar, ClipboardList, Package, Target, CheckCircle2 } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { formatLabel, PRIORIDAD_SOLICITUD_LABELS } from '@/lib/enums'

interface Detalle {
  id: number
  meta: number
  recibido: number
  descripcion: string | null
  producto: { id: number; nombre: string; categoria?: { nombre: string } }
}

interface SolicitudDetalle {
  id: number
  titulo: string
  descripcion: string | null
  prioridad: string
  estado: string
  createdAt: string
  campania?: { nombre: string }
  ubicacion?: { nombre: string }
  detalles: Detalle[]
}

const estadoVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  ABIERTA: 'default',
  EN_PROCESO: 'outline',
  COMPLETADA: 'secondary',
  CANCELADA: 'destructive',
}

const prioridadVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  BAJA: 'secondary',
  MEDIA: 'default',
  ALTA: 'destructive',
  URGENTE: 'destructive',
}

export default function SolicitudDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [editValues, setEditValues] = useState<Record<number, string>>({})

  const { data: solicitud, isLoading } = useQuery<SolicitudDetalle>({
    queryKey: ['solicitud', params.id],
    queryFn: () => api.get(`/solicitudes/${params.id}`),
    enabled: !!params.id,
  })

  const mutation = useMutation({
    mutationFn: ({ detalleId, recibido }: { detalleId: number; recibido: number }) =>
      api.patch(`/solicitudes/${params.id}/detalles/${detalleId}`, { recibido }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitud', params.id] })
      queryClient.invalidateQueries({ queryKey: ['solicitudes'] })
    },
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

  if (!solicitud) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Solicitud no encontrada</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/admin/solicitudes')}>
          Volver
        </Button>
      </div>
    )
  }

  const progress = solicitud.detalles.length > 0
    ? Math.round(
        (solicitud.detalles.reduce((s, d) => s + d.recibido, 0) /
          solicitud.detalles.reduce((s, d) => s + d.meta, 0)) *
          100,
      )
    : 0

  const handleSaveRecibido = (detalleId: number) => {
    const val = parseInt(editValues[detalleId], 10)
    if (isNaN(val) || val < 0) return
    mutation.mutate({ detalleId, recibido: val })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon-sm" onClick={() => router.push('/admin/solicitudes')}>
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{solicitud.titulo}</h1>
          <p className="text-muted-foreground text-sm">Detalle de la solicitud</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={prioridadVariants[solicitud.prioridad] ?? 'outline'} className="text-sm px-3 py-1">
            {formatLabel(solicitud.prioridad, PRIORIDAD_SOLICITUD_LABELS)}
          </Badge>
          <Badge variant={estadoVariants[solicitud.estado] ?? 'outline'} className="text-sm px-3 py-1">
            {solicitud.estado === 'COMPLETADA' ? 'Completada' :
             solicitud.estado === 'EN_PROCESO' ? 'En Proceso' :
             solicitud.estado === 'CANCELADA' ? 'Cancelada' : 'Abierta'}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ClipboardList className="size-4" />
              Campaña
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{solicitud.campania?.nombre ?? '—'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MapPin className="size-4" />
              Ubicación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{solicitud.ubicacion?.nombre ?? '—'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="size-4" />
              Creada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{new Date(solicitud.createdAt).toLocaleDateString()}</p>
          </CardContent>
        </Card>
      </div>

      {solicitud.descripcion && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Descripción</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap text-muted-foreground">{solicitud.descripcion}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="size-4" />
            Progreso general
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <span className="text-sm font-medium tabular-nums">{progress}%</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Package className="size-4" />
            Productos solicitados ({solicitud.detalles.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {solicitud.detalles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No hay productos en esta solicitud
            </div>
          ) : (
            <div className="divide-y">
              {solicitud.detalles.map((det) => {
                const pct = det.meta > 0 ? Math.round((det.recibido / det.meta) * 100) : 0
                const completo = det.recibido >= det.meta
                return (
                  <div key={det.id} className="px-6 py-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{det.producto.nombre}</p>
                        {det.producto.categoria && (
                          <span className="text-xs text-muted-foreground">
                            {det.producto.categoria.nombre}
                          </span>
                        )}
                        {completo && (
                          <CheckCircle2 className="size-4 text-green-600" />
                        )}
                      </div>
                      <span className="text-sm font-medium tabular-nums">
                        {det.recibido} / {det.meta}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            completo ? 'bg-green-500' : 'bg-primary'
                          }`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm tabular-nums text-muted-foreground min-w-[3ch]">
                        {pct}%
                      </span>
                    </div>

                    {det.descripcion && (
                      <p className="text-xs text-muted-foreground">{det.descripcion}</p>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <Input
                        type="number"
                        min={0}
                        max={det.meta}
                        className="w-24 h-8 text-xs"
                        placeholder="Recibido"
                        value={editValues[det.id] ?? ''}
                        onChange={(e) =>
                          setEditValues((prev) => ({ ...prev, [det.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveRecibido(det.id)
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        disabled={mutation.isPending}
                        onClick={() => handleSaveRecibido(det.id)}
                      >
                        Actualizar
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
