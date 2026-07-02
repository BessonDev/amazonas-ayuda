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
  ArrowRight,
  Hash,
  Tag,
  Activity,
  Settings2,
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useRole } from '@/hooks/use-role'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

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

interface Ubicacion {
  id: number
  nombre: string
}

export default function LotesPage() {
  const [search, setSearch] = useState('')
  const [qrLote, setQrLote] = useState<Lote | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editLote, setEditLote] = useState<Lote | undefined>(undefined)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [transferOpen, setTransferOpen] = useState(false)
  const [destinoId, setDestinoId] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [confirmState, setConfirmState] = useState<{
    open: boolean
    title: string
    description: string
    variant?: 'destructive' | 'default'
    onConfirm: () => void
  } | null>(null)
  const queryClient = useQueryClient()
  const { canManage, canDelete, canTransfer } = useRole()

  const { data: lotes = [], isLoading } = useQuery({
    queryKey: ['lotes'],
    queryFn: () => api.get<Lote[]>('/lotes'),
  })

  const { data: ubicaciones = [] } = useQuery<Ubicacion[]>({
    queryKey: ['ubicaciones'],
    queryFn: () => api.get('/ubicaciones'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/lotes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lotes'] })
      toast.success('Lote eliminado')
    },
  })

  const transferMutation = useMutation({
    mutationFn: () =>
      api.post('/lotes/transferir', {
        loteIds: Array.from(selectedIds),
        ubicacionDestinoId: Number(destinoId),
        observaciones: observaciones || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lotes'] })
      toast.success('Lote(s) transferido(s) correctamente')
      setSelectedIds(new Set())
      setDestinoId('')
      setObservaciones('')
      setTransferOpen(false)
    },
  })

  const filtered = lotes.filter((l) =>
    l.codigo.toLowerCase().includes(search.toLowerCase()) ||
    (l.observaciones ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const allFilteredSelected = filtered.length > 0 && filtered.every((l) => selectedIds.has(l.id))
  const someFilteredSelected = filtered.some((l) => selectedIds.has(l.id))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventario</h1>
          <p className="text-muted-foreground">Gestión de inventario y lotes de productos</p>
        </div>
        <div className="flex items-center gap-2">
          {canTransfer && (
            <Button
              variant="outline"
              disabled={selectedIds.size === 0}
              onClick={() => { setDestinoId(''); setObservaciones(''); setTransferOpen(true) }}
            >
              <ArrowRight className="size-4" />
              Transferir ({selectedIds.size})
            </Button>
          )}
          {canManage && (
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="size-4" />
              Nuevo Lote
            </Button>
          )}
        </div>
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
        {selectedIds.size > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
            <X className="size-4" />
            Limpiar selección
          </Button>
        )}
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
                {canTransfer && (
                  <TableHead className="w-10">
                    <Checkbox
                      checked={allFilteredSelected}
                      indeterminate={!allFilteredSelected && someFilteredSelected}
                      onCheckedChange={() => {
                        if (allFilteredSelected) {
                          setSelectedIds(new Set())
                        } else {
                          setSelectedIds(new Set(filtered.map((l) => l.id)))
                        }
                      }}
                    />
                  </TableHead>
                )}
                <TableHead><Tag className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Código</TableHead>
                <TableHead><Package className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Producto</TableHead>
                <TableHead><MapPin className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Ubicación</TableHead>
                <TableHead className="text-right"><Hash className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Cantidad</TableHead>
                <TableHead><Activity className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Estado</TableHead>
                <TableHead className="text-right"><Settings2 className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No hay lotes registrados
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((lote) => {
                  const stockLevel = lote.cantidad >= 100 ? 'high' : lote.cantidad >= 20 ? 'medium' : 'low'
                  const stockDot = stockLevel === 'high' ? 'bg-emerald-500' : stockLevel === 'medium' ? 'bg-amber-500' : 'bg-red-500'
                  return (
                    <TableRow key={lote.id}>
                      {canTransfer && (
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(lote.id)}
                            onCheckedChange={(checked) => {
                              setSelectedIds((prev) => {
                                const next = new Set(prev)
                                if (checked) { next.add(lote.id) } else { next.delete(lote.id) }
                                return next
                              })
                            }}
                          />
                        </TableCell>
                      )}
                      <TableCell className="font-mono text-xs">{lote.codigo}</TableCell>
                      <TableCell>
                        <div className="text-sm">{lote.producto?.nombre ?? '-'}</div>
                        {lote.observaciones && (
                          <div className="text-xs text-muted-foreground truncate max-w-[180px]">{lote.observaciones}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{lote.ubicacion?.nombre ?? '-'}</TableCell>
                      <TableCell className="text-right">
                        <span className="inline-flex items-center gap-1.5 font-medium tabular-nums">
                          <span className={`size-2 rounded-full ${stockDot} shrink-0`} />
                          {lote.cantidad}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{lote.estado}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {lote.qrUrl && (
                            <Button variant="ghost" size="icon-sm" onClick={() => setQrLote(lote)}>
                              <QrCode className="size-4" />
                            </Button>
                          )}
                          {canManage && (
                            <Button variant="ghost" size="icon-sm" onClick={() => { setEditLote(lote); setFormOpen(true) }}>
                              <Edit className="size-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button variant="ghost" size="icon-sm" onClick={() => setConfirmState({
                              open: true,
                              title: 'Eliminar lote',
                              description: `¿Estás seguro de eliminar el lote "${lote.codigo}"? Esta acción no se puede deshacer.`,
                              onConfirm: () => deleteMutation.mutate(lote.id),
                            })}>
                              <Trash2 className="size-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <LoteForm
        open={formOpen}
        onOpenChange={(open) => { setFormOpen(open); if (!open) setEditLote(undefined) }}
        lote={editLote}
      />

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

      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transferir {selectedIds.size} lote(s)</DialogTitle>
            <DialogDescription>
              Selecciona la ubicación de destino para transferir los lotes seleccionados.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="destino">Ubicación de destino</Label>
              <Select value={destinoId} onValueChange={(v) => setDestinoId(v ?? '')}>
                <SelectTrigger id="destino">
                  <SelectValue placeholder="Seleccionar ubicación..." />
                </SelectTrigger>
                <SelectContent>
                  {ubicaciones.map((u) => (
                    <SelectItem key={u.id} value={u.id.toString()}>{u.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="obs">Observaciones (opcional)</Label>
              <Input
                id="obs"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Motivo de la transferencia..."
              />
            </div>

            <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
              <Warehouse className="size-4 inline mr-1.5 -mt-0.5" />
              Los lotes seleccionados cambiarán de ubicación y se generarán movimientos de inventario
              (<strong>TRANSFERENCIA</strong> en origen, <strong>ENTRADA</strong> en destino).
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setTransferOpen(false)}>Cancelar</Button>
            <Button
              disabled={!destinoId || transferMutation.isPending}
              onClick={() => transferMutation.mutate()}
            >
              {transferMutation.isPending ? 'Transfiriendo...' : (
                <><ArrowRight className="size-4" /> Transferir</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
