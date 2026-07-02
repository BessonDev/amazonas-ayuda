'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, ArrowDown, ArrowUp, ArrowLeftRight, RefreshCw, Package, Tag, MapPin, Hash, Calendar, MessageSquareText, Activity } from 'lucide-react'
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
  observaciones: string | null
  createdAt: string
  lote?: { codigo: string }
  ubicacion?: { nombre: string }
}

const TIPOS = ['ENTRADA', 'TRANSFERENCIA', 'ENVIO', 'RECEPCION', 'AJUSTE'] as const

const tipoConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof ArrowDown }> = {
  ENTRADA: { variant: 'default', icon: ArrowDown },
  TRANSFERENCIA: { variant: 'outline', icon: ArrowLeftRight },
  ENVIO: { variant: 'destructive', icon: ArrowUp },
  RECEPCION: { variant: 'default', icon: ArrowDown },
  AJUSTE: { variant: 'secondary', icon: RefreshCw },
}

export default function MovimientosPage() {
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [filtroTipo, setFiltroTipo] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: movimientos = [], isLoading } = useQuery({
    queryKey: ['movimientos'],
    queryFn: () => api.get<Movimiento[]>('/movimientos'),
  })

  const filtered = movimientos.filter((m) => {
    if (filtroTipo && m.tipo !== filtroTipo) return false
    return (
      (m.lote?.codigo ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (m.observaciones ?? '').toLowerCase().includes(search.toLowerCase())
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Movimientos</h1>
          <p className="text-muted-foreground">Historial de movimientos de inventario</p>
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

      <div className="flex items-center gap-2 flex-wrap">
        {TIPOS.map((tipo) => {
          const cfg = tipoConfig[tipo]
          return (
            <Button
              key={tipo}
              variant={filtroTipo === tipo ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFiltroTipo(filtroTipo === tipo ? null : tipo)}
            >
              {cfg && <cfg.icon className="size-3.5 mr-1.5" />}
              {tipo}
            </Button>
          )
        })}
        {filtroTipo && (
          <Button variant="ghost" size="sm" onClick={() => setFiltroTipo(null)}>
            Limpiar filtro
          </Button>
        )}
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
                <TableHead><Activity className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Tipo</TableHead>
                <TableHead className="text-right"><Hash className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Cantidad</TableHead>
                <TableHead><Tag className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Lote</TableHead>
                <TableHead><MapPin className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Ubicación</TableHead>
                <TableHead><MessageSquareText className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Observaciones</TableHead>
                <TableHead><Calendar className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Fecha</TableHead>
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
                    No hay movimientos registrados
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((mov) => {
                  const cfg = tipoConfig[mov.tipo]
                  const Icon = cfg?.icon ?? Package
                  return (
                    <TableRow key={mov.id}>
                      <TableCell>
                        <Badge variant={cfg?.variant ?? 'outline'} className="gap-1">
                          <Icon className="size-3" />
                          {mov.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">{mov.cantidad}</TableCell>
                      <TableCell className="font-mono text-xs">{mov.lote?.codigo ?? '-'}</TableCell>
                      <TableCell className="text-sm">{mov.ubicacion?.nombre ?? '-'}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                        {mov.observaciones ?? <span className="text-xs">—</span>}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(mov.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
