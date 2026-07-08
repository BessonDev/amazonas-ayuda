'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, Calendar, ClipboardList, Package, Target, CheckCircle2, Box, Weight, Droplets, Pill, Shirt, FlaskConical, Sofa, Truck, Home, Building2, Church, Users, XCircle } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useRole } from '@/hooks/use-role'
import { toast } from 'sonner'
import { formatLabel, PRIORIDAD_SOLICITUD_LABELS, UNIDAD_MEDIDA_ABREV } from '@/lib/enums'

interface Detalle {
  id: number
  meta: number
  recibido: number
  descripcion: string | null
  producto: { id: number; nombre: string; categoria?: { nombre: string }; unidad?: string }
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

// Variantes de progreso estilo dashboard
const progressVariants = {
  complete: {
    gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
    border: 'border-emerald-200 dark:border-emerald-800',
    icon: 'text-emerald-500',
    silhouette: 'text-emerald-500/10 dark:text-emerald-500/15',
    value: 'text-emerald-700 dark:text-emerald-300',
  },
  inProgress: {
    gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
    border: 'border-amber-200 dark:border-amber-800',
    icon: 'text-amber-500',
    silhouette: 'text-amber-500/10 dark:text-amber-500/15',
    value: 'text-amber-700 dark:text-amber-300',
  },
  pending: {
    gradient: 'from-red-500/10 via-red-500/5 to-transparent',
    border: 'border-red-200 dark:border-red-800',
    icon: 'text-red-500',
    silhouette: 'text-red-500/10 dark:text-red-500/15',
    value: 'text-red-700 dark:text-red-300',
  },
  default: {
    gradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-500',
    silhouette: 'text-blue-500/10 dark:text-blue-500/15',
    value: 'text-blue-700 dark:text-blue-300',
  },
}

const categoriaIcons: Record<string, typeof Truck> = {
  Alimentos: Package,
  Agua: Droplets,
  Medicinas: FlaskConical,
  Higiene: Pill,
  Ropa: Shirt,
  Cobijas: Sofa,
  Herramientas: Weight,
  Otros: Box,
}

const getIconForCategoria = (categoria?: string) => categoriaIcons[categoria ?? ''] ?? Package

export default function SolicitudDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { isResponsable, isOperator, isCoord, isAdmin } = useRole()
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

  const cancelMutation = useMutation({
    mutationFn: () => api.patch(`/solicitudes/${params.id}`, { estado: 'CANCELADA' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitud', params.id] })
      queryClient.invalidateQueries({ queryKey: ['solicitudes'] })
      toast.success('Solicitud cancelada')
    },
    onError: () => toast.error('Error al cancelar la solicitud'),
  })

  const [confirmCancel, setConfirmCancel] = useState(false)

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
          {solicitud.estado !== 'CANCELADA' && (
            <Button variant="outline" size="sm" onClick={() => setConfirmCancel(true)}>
              <XCircle className="size-4" />
              Cancelar
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="relative overflow-hidden border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-transparent transition-all hover:shadow-md hover:-translate-y-0.5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-emerald-100 text-emerald-600">
                <ClipboardList className="size-4" />
              </div>
              Campaña
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{solicitud.campania?.nombre ?? '—'}</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-amber-200 bg-gradient-to-br from-amber-50/80 to-transparent transition-all hover:shadow-md hover:-translate-y-0.5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-amber-100 text-amber-600">
                <MapPin className="size-4" />
              </div>
              Ubicación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{solicitud.ubicacion?.nombre ?? '—'}</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-blue-200 bg-gradient-to-br from-blue-50/80 to-transparent transition-all hover:shadow-md hover:-translate-y-0.5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-blue-100 text-blue-600">
                <Calendar className="size-4" />
              </div>
              Creada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{new Date(solicitud.createdAt).toLocaleDateString()}</p>
          </CardContent>
        </Card>
      </div>

      {solicitud.descripcion && (
        <Card className="relative overflow-hidden border-slate-200 bg-gradient-to-br from-slate-50/50 to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                <ClipboardList className="size-4" />
              </div>
              Descripción
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap text-muted-foreground">{solicitud.descripcion}</p>
          </CardContent>
        </Card>
      )}

      <Card className={`relative overflow-hidden border-2 transition-all ${progress >= 100 ? 'border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-transparent' : progress > 0 ? 'border-amber-200 bg-gradient-to-br from-amber-50/80 to-transparent' : 'border-red-200 bg-gradient-to-br from-red-50/80 to-transparent'}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className={`flex size-7 items-center justify-center rounded-md ${progress >= 100 ? 'bg-emerald-100 text-emerald-600' : progress > 0 ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
              <Target className="size-4" />
            </div>
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
            <div className="p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {solicitud.detalles.map((det) => {
                const pct = det.meta > 0 ? Math.round((det.recibido / det.meta) * 100) : 0
                const completo = det.recibido >= det.meta
                const variant = completo ? 'complete' : pct > 0 ? 'inProgress' : 'pending'
                const v = progressVariants[variant]
                const unit = det.producto.unidad ? UNIDAD_MEDIDA_ABREV[det.producto.unidad] ?? det.producto.unidad.toLowerCase() : ''
                const CategoriaIcon = getIconForCategoria(det.producto.categoria?.nombre)

                return (
                  <Card
                    key={det.id}
                    className={`relative overflow-hidden group border-2 transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-default ${v.border} ${v.gradient}`}
                  >
                    <CategoriaIcon className={`absolute -bottom-3 -right-3 size-24 ${v.silhouette} transition-transform group-hover:scale-110 group-hover:rotate-3`} />
                    <CardHeader className="pb-1 relative">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`flex size-8 items-center justify-center rounded-md bg-white/80 dark:bg-black/20 ${v.icon}`}>
                            <CategoriaIcon className="size-4.5" />
                          </div>
                          <CardTitle className="text-sm font-medium">{det.producto.nombre}</CardTitle>
                        </div>
                        {completo && (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <CheckCircle2 className="size-2.5" />
                            Completo
                          </Badge>
                        )}
                      </div>
                      {det.producto.categoria && (
                        <p className="text-xs text-muted-foreground">{det.producto.categoria.nombre}</p>
                      )}
                    </CardHeader>
                    <CardContent className="relative space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-xl font-bold tabular-nums ${v.value}`}>
                          {det.recibido} <span className="text-muted-foreground font-normal">/</span> {det.meta}
                          {unit && <span className="text-muted-foreground font-normal text-sm ml-1">{unit}</span>}
                        </span>
                        <span className="text-xs tabular-nums text-muted-foreground min-w-[3ch] font-medium">{pct}%</span>
                      </div>

                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            completo ? 'bg-emerald-500' : pct > 0 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>

                      {det.descripcion && (
                        <p className="text-xs text-muted-foreground bg-muted/30 rounded px-2 py-1.5 italic">{det.descripcion}</p>
                      )}

{isAdmin && (
  <div className="flex items-center gap-2 pt-1 border-t border-dashed">
    <Input
      type="number"
      min={0}
      max={det.meta}
      className="w-20 h-8 text-xs"
      placeholder="Recibido"
      value={editValues[det.id] ?? ''}
      onChange={(e) =>
        setEditValues((prev) => ({ ...prev, [det.id]: e.target.value }))
      }
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          handleSaveRecibido(det.id);
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
)}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title="Cancelar solicitud"
        description={`¿Estás seguro de cancelar la solicitud "${solicitud.titulo}"? Esta acción no se puede deshacer.`}
        variant="destructive"
        onConfirm={() => {
          cancelMutation.mutate()
          setConfirmCancel(false)
        }}
      />
    </div>
  )
}
