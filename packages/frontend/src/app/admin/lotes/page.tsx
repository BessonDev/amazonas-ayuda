'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Search,
  QrCode,
  Edit,
  Trash2,
  X,
  Package,
  Warehouse,
  User,
  MapPin,
  ClipboardList,
} from 'lucide-react'
import { api } from '@/lib/api'
import { LoteForm } from './lote-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'

interface Lote {
  id: number
  codigo: string
  cantidad: number
  fecha: string
  observaciones: string | null
  estado: string
  qrUrl: string | null
  donanteId: number | null
  productoId: number
  ubicacionId: number
  campaniaId: number
  donante?: { nombre: string }
  producto?: { nombre: string }
  ubicacion?: { nombre: string }
  campania?: { nombre: string }
}

export default function LotesPage() {
  const [search, setSearch] = useState('')
  const [qrLote, setQrLote] = useState<Lote | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editLote, setEditLote] = useState<Lote | null>(null)
  const queryClient = useQueryClient()

  const { data: lotes = [], isLoading } = useQuery({
    queryKey: ['lotes'],
    queryFn: () => api.get<Lote[]>('/lotes'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/lotes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lotes'] })
    },
  })

  const filtered = lotes.filter((l) =>
    l.codigo.toLowerCase().includes(search.toLowerCase()) ||
    (l.observaciones ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lotes</h1>
          <p className="text-muted-foreground">Gestión de lotes de productos</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="size-4" />
          Nuevo Lote
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código o descripción..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            {filtered.length} lote(s) encontrado(s)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Observaciones</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Donante</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Campaña</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    No hay lotes registrados
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((lote) => (
                  <TableRow key={lote.id}>
                    <TableCell className="font-mono text-xs">{lote.codigo}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{lote.observaciones ?? '-'}</TableCell>
                    <TableCell>{lote.producto?.nombre ?? '-'}</TableCell>
                    <TableCell>{lote.donante?.nombre ?? '-'}</TableCell>
                    <TableCell>{lote.ubicacion?.nombre ?? '-'}</TableCell>
                    <TableCell>{lote.campania?.nombre ?? '-'}</TableCell>
                    <TableCell className="text-right font-medium">{lote.cantidad}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {lote.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {new Date(lote.fecha).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {lote.qrUrl && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setQrLote(lote)}
                          >
                            <QrCode className="size-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => { setEditLote(lote); setFormOpen(true) }}
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            if (confirm('¿Eliminar este lote?')) {
                              deleteMutation.mutate(lote.id)
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

      <LoteForm
        open={formOpen}
        onOpenChange={(open) => { setFormOpen(open); if (!open) setEditLote(null) }}
        lote={editLote}
      />

      <Dialog open={!!qrLote} onOpenChange={(open) => !open && setQrLote(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Código QR - {qrLote?.codigo}</DialogTitle>
            <DialogDescription>
              Escanee para ver información del lote
            </DialogDescription>
          </DialogHeader>
          {qrLote?.qrUrl && (
            <div className="flex justify-center p-4">
              <img
                src={qrLote.qrUrl}
                alt={`QR del lote ${qrLote.codigo}`}
                className="size-48"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
