'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Download, Trash2, Upload, Image, FileText, HardDrive, Building2, Calendar, Settings2, Truck } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRole } from '@/hooks/use-role'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { FileUpload } from '@/components/ui/file-upload'

interface Archivo {
  id: number
  nombre: string
  url: string
  mimeType: string
  tamanio: number
  entidadTipo: string
  entidadId: number
  viajeId: number | null
  campaniaId: number | null
  createdAt: string
}

interface Recepcion {
  id: number
  viaje: { codigo: string }
  createdAt: string
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

function getMimeBadge(mime: string): string {
  if (mime.startsWith('image/')) return 'Imagen'
  if (mime.startsWith('application/pdf')) return 'PDF'
  if (mime.startsWith('application/') && mime.includes('spreadsheet')) return 'Hoja de cálculo'
  if (mime.startsWith('application/') && mime.includes('document')) return 'Documento'
  if (mime.startsWith('text/')) return 'Texto'
  return mime
}

export default function ArchivosPage() {
  const [search, setSearch] = useState('')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadRecepcionId, setUploadRecepcionId] = useState('')
  const [uploadError, setUploadError] = useState('')
  const queryClient = useQueryClient()
  const { canManage, canDelete } = useRole()

  const [confirmState, setConfirmState] = useState<{
    open: boolean
    title: string
    description: string
    variant?: 'destructive' | 'default'
    onConfirm: () => void
  } | null>(null)

  const { data: archivos = [], isLoading } = useQuery({
    queryKey: ['archivos'],
    queryFn: () => api.get<Archivo[]>('/archivos'),
  })

  const { data: recepciones = [] } = useQuery<Recepcion[]>({
    queryKey: ['recepciones'],
    queryFn: () => api.get('/viajes/recepciones'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/archivos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['archivos'] })
      toast.success('Imagen eliminada')
    },
  })

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => api.postForm('/archivos/upload', formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['archivos'] })
      toast.success('Imagen subida correctamente')
      setUploadOpen(false)
      setUploadFile(null)
      setUploadRecepcionId('')
      setUploadError('')
    },
    onError: (err: Error) => {
      setUploadError(err.message)
      toast.error(err.message)
    },
  })

  const handleUpload = () => {
    if (!uploadFile) { setUploadError('Selecciona un archivo'); return }
    const formData = new FormData()
    formData.append('archivo', uploadFile)

    let nombre = uploadFile.name
    if (uploadRecepcionId) {
      const recepcion = recepciones.find((r) => r.id.toString() === uploadRecepcionId)
      formData.append('entidadTipo', 'Recepcion')
      formData.append('entidadId', uploadRecepcionId)
      if (recepcion?.viaje?.codigo) {
        nombre = `Entrega ${recepcion.viaje.codigo} — ${uploadFile.name}`
      }
    } else {
      formData.append('entidadTipo', 'General')
      formData.append('entidadId', '0')
    }
    formData.append('nombre', nombre)
    uploadMutation.mutate(formData)
  }

  const filtered = archivos.filter((a) =>
    a.nombre.toLowerCase().includes(search.toLowerCase()) ||
    a.entidadTipo.toLowerCase().includes(search.toLowerCase()) ||
    a.mimeType.toLowerCase().includes(search.toLowerCase())
  )

  const downloadUrl = (archivo: Archivo) => `/api/archivos/${archivo.id}/descargar`

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Imágenes</h1>
          <p className="text-muted-foreground">Imágenes del sistema</p>
        </div>
        {canManage && (
          <Button size="sm" onClick={() => setUploadOpen(true)}>
            <Upload className="size-4 mr-2" />
            Subir imagen
          </Button>
        )}
      </div>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Subir imagen</DialogTitle>
            <DialogDescription>
              Selecciona una imagen para subir al sistema. Opcionalmente, asígnala a una entrega para que aparezca en la galería pública.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 min-w-0">
            <FileUpload
              accept="image/*"
              maxSize={10}
              value={uploadFile}
              onChange={(f) => { setUploadFile(f); setUploadError('') }}
            />

            <div className="space-y-2">
              <Label>Referencia a entrega (opcional)</Label>
              <Select value={uploadRecepcionId} onValueChange={(v) => setUploadRecepcionId(v ?? '')}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string | null) => {
                      if (!value) return 'Sin referencia — no aparece en galería pública'
                      const r = recepciones.find(r => r.id.toString() === value)
                      return r ? `Entrega #${r.id} — ${r.viaje.codigo}` : value
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin referencia</SelectItem>
                  {recepciones.map((r) => (
                    <SelectItem key={r.id} value={r.id.toString()}>
                      Entrega #{r.id} — {r.viaje.codigo} ({new Date(r.createdAt).toLocaleDateString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Al seleccionar una entrega, la imagen aparecerá en el carrusel del portal público
              </p>
            </div>

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

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, tipo o entidad..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            {filtered.length} imagen(es) encontrada(s)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><Image className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Nombre</TableHead>
                <TableHead><FileText className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Tipo</TableHead>
                <TableHead className="text-right"><HardDrive className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Tamaño</TableHead>
                <TableHead><Building2 className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Entidad</TableHead>
                <TableHead><Calendar className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Fecha</TableHead>
                <TableHead className="text-right"><Settings2 className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No hay imágenes registradas
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((archivo) => (
                  <TableRow key={archivo.id}>
                    <TableCell className="max-w-[250px] truncate font-medium">{archivo.nombre}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{getMimeBadge(archivo.mimeType)}</Badge>
                    </TableCell>
                    <TableCell className="text-right text-xs">{formatSize(archivo.tamanio)}</TableCell>
                    <TableCell className="text-xs">
                      <span className="font-mono">{archivo.entidadTipo}</span>
                      <span className="text-muted-foreground"> #{archivo.entidadId}</span>
                    </TableCell>
                    <TableCell className="text-xs">
                      {new Date(archivo.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {archivo.mimeType.startsWith('image/') && (
                          <a
                            href={downloadUrl(archivo)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center size-7 rounded-md hover:bg-muted"
                          >
                            <Image className="size-4" />
                          </a>
                        )}
                        <a
                          href={downloadUrl(archivo)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center size-7 rounded-md hover:bg-muted"
                        >
                          <Download className="size-4" />
                        </a>
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setConfirmState({
                              open: true,
                              title: 'Eliminar imagen',
                              description: `¿Estás seguro de eliminar la imagen "${archivo.nombre}"? Esta acción no se puede deshacer.`,
                              onConfirm: () => deleteMutation.mutate(archivo.id),
                            })}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!confirmState}
        onOpenChange={(open) => !open && setConfirmState(null)}
        title={confirmState?.title ?? ''}
        description={confirmState?.description ?? ''}
        variant={confirmState?.variant ?? 'destructive'}
        onConfirm={() => {
          confirmState?.onConfirm()
          setConfirmState(null)
        }}
      />
    </div>
  )
}
