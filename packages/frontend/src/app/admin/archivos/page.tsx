'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Download, Trash2, Upload, Image } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  const [uploadError, setUploadError] = useState('')
  const queryClient = useQueryClient()

  const { data: archivos = [], isLoading } = useQuery({
    queryKey: ['archivos'],
    queryFn: () => api.get<Archivo[]>('/archivos'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/archivos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['archivos'] })
    },
  })

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => api.postForm('/archivos/upload', formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['archivos'] })
      setUploadOpen(false)
      setUploadFile(null)
      setUploadError('')
    },
    onError: (err: Error) => {
      setUploadError(err.message)
    },
  })

  const handleUpload = () => {
    if (!uploadFile) { setUploadError('Selecciona un archivo'); return }
    const formData = new FormData()
    formData.append('archivo', uploadFile)
    formData.append('nombre', uploadFile.name)
    formData.append('entidadTipo', 'General')
    formData.append('entidadId', '0')
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Archivos</h1>
          <p className="text-muted-foreground">Archivos adjuntos del sistema</p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <Upload className="size-4 mr-2" />
          Subir archivo
        </Button>
      </div>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Subir archivo</DialogTitle>
            <DialogDescription>
              Selecciona un archivo para subir al sistema
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <FileUpload
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv"
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
            {filtered.length} archivo(s) encontrado(s)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Tamaño</TableHead>
                <TableHead>Entidad</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
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
                    No hay archivos registrados
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
                        <a
                          href={downloadUrl(archivo)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center size-7 rounded-md hover:bg-muted"
                        >
                          <Download className="size-4" />
                        </a>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            if (confirm('¿Eliminar este archivo?')) {
                              deleteMutation.mutate(archivo.id)
                            }
                          }}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
