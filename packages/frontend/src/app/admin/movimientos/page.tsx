'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Trash2 } from 'lucide-react'
import { MovimientoForm } from './movimiento-form'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Movimiento {
  id: number
  tipo: string
  cantidad: number
  saldoAnterior: number | null
  saldoNuevo: number | null
  observaciones: string | null
  createdAt: string
  lote?: { codigo: string }
  ubicacion?: { nombre: string }
}

const tipoVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  ENTRADA: 'default',
  TRANSFERENCIA: 'outline',
  ENVIO: 'destructive',
  RECEPCION: 'default',
  AJUSTE: 'secondary',
}

export default function MovimientosPage() {
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: movimientos = [], isLoading } = useQuery({
    queryKey: ['movimientos'],
    queryFn: () => api.get<Movimiento[]>('/movimientos'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/movimientos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movimientos'] })
    },
  })

  const filtered = movimientos.filter((m) =>
    (m.lote?.codigo ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (m.observaciones ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Movimientos</h1>
          <p className="text-muted-foreground">Gestión de movimientos de inventario</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="size-4 mr-2" />
          Nuevo movimiento
        </Button>
      </div>

      <MovimientoForm open={formOpen} onOpenChange={setFormOpen} />

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por lote o descripción..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            {filtered.length} movimiento(s) encontrado(s)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Saldo Anterior</TableHead>
                <TableHead className="text-right">Saldo Nuevo</TableHead>
                <TableHead>Lote</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Observaciones</TableHead>
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
                    No hay movimientos registrados
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((mov) => (
                  <TableRow key={mov.id}>
                    <TableCell className="text-xs">{mov.id}</TableCell>
                    <TableCell>
                      <Badge variant={tipoVariants[mov.tipo] ?? 'outline'}>
                        {mov.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{mov.cantidad}</TableCell>
                    <TableCell className="text-right">{mov.saldoAnterior ?? '-'}</TableCell>
                    <TableCell className="text-right">{mov.saldoNuevo ?? '-'}</TableCell>
                    <TableCell className="font-mono text-xs">{mov.lote?.codigo ?? '-'}</TableCell>
                    <TableCell>{mov.ubicacion?.nombre ?? '-'}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{mov.observaciones ?? '-'}</TableCell>
                    <TableCell className="text-xs">
                      {new Date(mov.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          if (confirm('¿Eliminar este movimiento?')) {
                            deleteMutation.mutate(mov.id)
                          }
                        }}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
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
