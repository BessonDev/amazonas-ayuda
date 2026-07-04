'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Truck, Calendar, User, MapPin, Pencil, Image, Upload, X, FileText, CheckCircle2 } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { formatEstadoViaje, formatEstadoLote } from '@/lib/enums'
import { CambiarEstadoDialog } from '../cambiar-estado-dialog'
import { ViajeForm } from '../viaje-form'
import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { FileUpload } from '@/components/ui/file-upload'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

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
  campania?: { id: number; nombre: string }
  origen?: { id: number; nombre: string }
  destino?: { id: number; nombre: string }
  detalles?: Array<{
    id: number
    cantidad: number
    lote: {
      id: number
      codigo: string
      cantidad: number
      estado: string
      producto?: { id: number; nombre: string }
      donante?: { nombre: string }
    }
  }>
  recepciones?: Array<{
    id: number
    fecha: string
    fotoRecepcionUrl: string | null
    responsable?: { id: number; nombre: string }
  }>
}

interface Archivo {
  id: number
  nombre: string
  url: string
  mimeType: string
  tamanio: number
  createdAt: string
}

const estadoVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PLANIFICADO: 'secondary',
  EN_TRANSITO: 'default',
  RECEPCION_PARCIAL: 'outline',
  COMPLETADO: 'default',
  CANCELADO: 'destructive',
}

const estadoLoteVariants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  DISPONIBLE: 'default',
  EN_TRANSITO: 'secondary',
  ENTREGADO: 'outline',
}

export default function ViajeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { usuario } = useAuth()
  const [estadoDialogOpen, setEstadstateDialogOpen] = useState(false)
  const [editFormOpen, setEditFormOpen] = useState(false)

  const puedeCambiarEstado = usuario?.rol === 'ADMINISTRADOR' || usuario?.rol === 'COORDINADOR_LOGISTICO'
  const puedeSubirFoto = usuario?.rol === 'ADMINISTRADOR' || usuario?.rol === 'COORDINADOR_LOGISTICO' || usuario?.rol === 'RESPONSABLE_DESTINO'

  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState('')
  const queryClient = useQueryClient()

  const { data: fotos = [] } = useQuery<Archivo[]>({
    queryKey: ['archivos-viaje', params.id],
    queryFn: () => api.get(`/archivos?entidadTipo=Viaje&entidadId=${params.id}`),
    enabled: !!params.id,
  })

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => api.postForm('/archivos/upload', formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['archivos-viaje', params.id] })
      toast.success('Foto subida correctamente')
      setUploadOpen(false)
      setUploadFile(null)
      setUploadError('')
    },
    onError: (err: Error) => {
      setUploadError(err.message)
      toast.error(err.message)
    },
  })

  const handleUpload = () => {
    if (!uploadFile) { setUploadError('Selecciona un archivo'); return }
    if (!viaje) return
    const formData = new FormData()
    formData.append('archivo', uploadFile)
    formData.append('nombre', `${viaje.codigo} — ${uploadFile.name}`)
    formData.append('entidadTipo', 'Viaje')
    formData.append('entidadId', String(viaje.id))
    formData.append('viajeId', String(viaje.id))
    uploadMutation.mutate(formData)
  }

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
        viaje={estadoDialogOpen ? { id: viaje.id, codigo: viaje.codigo, estado: viaje.estado } : null}
        onOpenChange={setEstadstateDialogOpen}
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="relative overflow-hidden border-blue-200 bg-gradient-to-br from-blue-50/80 to-transparent transition-all hover:shadow-md hover:-translate-y-0.5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-blue-100 text-blue-600">
                <User className="size-4" />
              </div>
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

        <Card className="relative overflow-hidden border-amber-200 bg-gradient-to-br from-amber-50/80 to-transparent transition-all hover:shadow-md hover:-translate-y-0.5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-amber-100 text-amber-600">
                <Truck className="size-4" />
              </div>
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

        <Card className="relative overflow-hidden border-purple-200 bg-gradient-to-br from-purple-50/80 to-transparent transition-all hover:shadow-md hover:-translate-y-0.5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-purple-100 text-purple-600">
                <Calendar className="size-4" />
              </div>
              Fechas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Salida: <span className="font-semibold">{viaje.fechaSalida ? new Date(viaje.fechaSalida).toLocaleDateString('es', { timeZone: 'UTC' }) : '—'}</span>
            </p>
            <p className="text-sm mt-1">
              Estimada: <span className="font-semibold">{viaje.fechaEstimada ? new Date(viaje.fechaEstimada).toLocaleDateString('es', { timeZone: 'UTC' }) : '—'}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="relative overflow-hidden border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-transparent transition-all hover:shadow-md hover:-translate-y-0.5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-emerald-100 text-emerald-600">
              <MapPin className="size-4" />
            </div>
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
        <Card className="relative overflow-hidden border-slate-200 bg-gradient-to-br from-slate-50/50 to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Observaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap text-muted-foreground">{viaje.observaciones}</p>
          </CardContent>
        </Card>
      )}

      <Card className="relative overflow-hidden border-slate-200 bg-gradient-to-br from-slate-50/30 to-transparent">
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
                    <Badge variant={estadoLoteVariants[det.lote.estado] ?? 'outline'} className="text-xs">
                      {formatEstadoLote(det.lote.estado)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {viaje.recepciones && viaje.recepciones.length > 0 && viaje.recepciones[0] && (
        <Card className="relative overflow-hidden border-blue-200 bg-gradient-to-br from-blue-50/50 to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="size-4 text-blue-600" />
              Recepción
            </CardTitle>
          </CardHeader>
          <CardContent>
            {viaje.recepciones.map((rec) => (
              <div key={rec.id} className="space-y-2">
                <p className="text-sm">
                  Recibido el{' '}
                  <span className="font-semibold">
                    {new Date(rec.fecha).toLocaleString()}
                  </span>
                  {rec.responsable && (
                    <> por <span className="font-semibold">{rec.responsable.nombre}</span></>
                  )}
                </p>
                {rec.fotoRecepcionUrl && (
                  <a
                    href={rec.fotoRecepcionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-2"
                  >
                    <img
                      src={rec.fotoRecepcionUrl}
                      alt="Foto de recepción"
                      className="max-h-48 rounded-lg border object-contain bg-muted"
                    />
                  </a>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Image className="size-4" />
            Fotos ({fotos.length})
          </CardTitle>
          {puedeSubirFoto && (
            <Button size="sm" onClick={() => setUploadOpen(true)}>
              <Upload className="size-4 mr-2" />
              Subir foto
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {fotos.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground text-sm">
              No hay fotos para este viaje
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {fotos.map((foto) => (
                <a
                  key={foto.id}
                  href={`/api/archivos/${foto.id}/descargar`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'group relative aspect-square rounded-lg overflow-hidden border bg-muted',
                    'hover:ring-2 hover:ring-primary/50 transition-all',
                  )}
                >
                  {foto.mimeType.startsWith('image/') ? (
                    <img
                      src={`/api/archivos/${foto.id}/descargar`}
                      alt={foto.nombre}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center size-full text-muted-foreground">
                      <FileText className="size-8" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs truncate">{foto.nombre}</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Subir foto</DialogTitle>
            <DialogDescription>
              Sube una foto para este viaje
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <FileUpload
              accept="image/*"
              maxSize={10}
              value={uploadFile}
              onChange={(f) => { setUploadFile(f); setUploadError('') }}
            />
            {uploadError && (
              <p className="text-sm text-destructive font-medium">{uploadError}</p>
            )}
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancelar
            </DialogClose>
            <Button onClick={handleUpload} disabled={!uploadFile || uploadMutation.isPending}>
              {uploadMutation.isPending ? 'Subiendo...' : 'Subir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ViajeForm
        open={editFormOpen}
        onOpenChange={setEditFormOpen}
        viaje={viaje}
      />
      </div>
  )
}
