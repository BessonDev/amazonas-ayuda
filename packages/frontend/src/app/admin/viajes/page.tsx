'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Plus, Search, Trash2, Send, ArrowRight, Tag, User, Truck, MapPin, ClipboardList, Activity, Settings2 } from 'lucide-react'
import { ViajeForm } from './viaje-form'
import { CambiarEstadoDialog } from './cambiar-estado-dialog'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { formatEstadoViaje } from '@/lib/enums'

interface Viaje {
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
}

const estadoVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PLANIFICADO: 'secondary',
  EN_TRANSITO: 'default',
  RECEPCION_PARCIAL: 'outline',
  COMPLETADO: 'default',
  CANCELADO: 'destructive',
}

const ESTADOS = ['PLANIFICADO', 'EN_TRANSITO', 'RECEPCION_PARCIAL', 'COMPLETADO', 'CANCELADO'] as const

export default function ViajesPage() {
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [estadoDialogViaje, setEstadstateDialogViaje] = useState<Viaje | null>(null)
  const [filtroEstado, setFiltroEstado] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { usuario } = useAuth()
  const router = useRouter()

  const puedeCambiarEstado = usuario?.rol === 'ADMINISTRADOR' || usuario?.rol === 'COORDINADOR_LOGISTICO'

  const { data: viajes = [], isLoading } = useQuery({
    queryKey: ['viajes'],
    queryFn: () => api.get<Viaje[]>('/viajes'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/viajes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viajes'] })
    },
  })

  const filtered = viajes.filter((v) => {
    if (filtroEstado && v.estado !== filtroEstado) return false
    return (
      v.codigo.toLowerCase().includes(search.toLowerCase()) ||
      (v.nombreResponsable ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (v.vehiculo ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (v.conductor ?? '').toLowerCase().includes(search.toLowerCase())
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Viajes</h1>
          <p className="text-muted-foreground">Gestión de viajes y transportes</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="size-4 mr-2" />
          Nuevo viaje
        </Button>
      </div>

      <ViajeForm open={formOpen} onOpenChange={setFormOpen} />

      <CambiarEstadoDialog
        viaje={estadoDialogViaje}
        onOpenChange={(open) => { if (!open) setEstadstateDialogViaje(null) }}
      />

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código, responsable, vehículo..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {ESTADOS.map((estado) => (
          <Button
            key={estado}
            variant={filtroEstado === estado ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFiltroEstado(filtroEstado === estado ? null : estado)}
          >
            <Activity className="size-3.5 mr-1.5" />
            {formatEstadoViaje(estado)}
          </Button>
        ))}
        {filtroEstado && (
          <Button variant="ghost" size="sm" onClick={() => setFiltroEstado(null)}>
            Limpiar filtro
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            {filtered.length} viaje(s) encontrado(s)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><Tag className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Código</TableHead>
                <TableHead><User className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Responsable</TableHead>
                <TableHead><Truck className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Vehículo</TableHead>
                <TableHead><User className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Conductor</TableHead>
                <TableHead><MapPin className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Origen → Destino</TableHead>
                <TableHead><ClipboardList className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Campaña</TableHead>
                <TableHead><Activity className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Estado</TableHead>
                <TableHead className="text-right"><Settings2 className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No hay viajes registrados
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((viaje) => (
                  <TableRow
                    key={viaje.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/admin/viajes/${viaje.id}`)}
                  >
                    <TableCell className="font-mono text-xs">{viaje.codigo}</TableCell>
                    <TableCell>{viaje.nombreResponsable ?? '-'}</TableCell>
                    <TableCell>{viaje.vehiculo ?? '-'}</TableCell>
                    <TableCell>{viaje.conductor ?? '-'}</TableCell>
                    <TableCell>
                      <span className="text-xs">{viaje.origen?.nombre ?? '?'}</span>
                      <ArrowRight className="inline size-3 mx-1 text-muted-foreground" />
                      <span className="text-xs">{viaje.destino?.nombre ?? '?'}</span>
                    </TableCell>
                    <TableCell>{viaje.campania?.nombre ?? '-'}</TableCell>
                    <TableCell>
                      <Badge variant={estadoVariants[viaje.estado] ?? 'outline'}>
                        {formatEstadoViaje(viaje.estado)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        {puedeCambiarEstado && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setEstadstateDialogViaje(viaje)}
                            title="Cambiar estado"
                          >
                            <Send className="size-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            if (confirm('¿Eliminar este viaje?')) {
                              deleteMutation.mutate(viaje.id)
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
