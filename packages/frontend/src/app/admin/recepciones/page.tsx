'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Trash2, Truck, User, MapPin, Calendar, CheckCircle, Package } from 'lucide-react'
import { RecepcionForm } from './recepcion-form'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatEstadoViaje } from '@/lib/enums'

interface Recepcion {
  id: number
  fecha: string
  observaciones: string | null
  viaje?: { codigo: string }
  responsable?: { nombre: string }
}

interface TmpViaje {
  id: number
  codigo: string
  estado: string
  conductor: string | null
  vehiculo: string | null
  fechaEstimada: string | null
  origen?: { nombre: string }
  destino?: { nombre: string }
}

const VIAJES_EN_CAMINO = ['EN_TRANSITO', 'LLEGO']

export default function RecepcionesPage() {
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [recepcionarViajeId, setRecepcionarViajeId] = useState<number | undefined>()
  const queryClient = useQueryClient()

  const { data: recepciones = [], isLoading } = useQuery({
    queryKey: ['recepciones'],
    queryFn: () => api.get<Recepcion[]>('/recepciones'),
  })

  const { data: viajes = [] } = useQuery({
    queryKey: ['viajes'],
    queryFn: () => api.get<TmpViaje[]>('/viajes'),
  })

  const viajesEnCamino = viajes.filter((v) => VIAJES_EN_CAMINO.includes(v.estado))

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/recepciones/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recepciones'] })
    },
  })

  const filtered = recepciones.filter((r) =>
    (r.viaje?.codigo ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (r.responsable?.nombre ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recepciones</h1>
          <p className="text-muted-foreground">Recepción de viajes y mercancía</p>
        </div>
        {viajesEnCamino.length === 0 && (
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="size-4 mr-2" />
            Nueva recepción
          </Button>
        )}
      </div>

      <RecepcionForm open={formOpen} onOpenChange={(v) => { setFormOpen(v); if (!v) setRecepcionarViajeId(undefined) }} defaultViajeId={recepcionarViajeId} />

      {viajesEnCamino.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Viajes en camino</h2>
            <Button variant="outline" size="sm" onClick={() => setFormOpen(true)}>
              <Plus className="size-4 mr-1" />
              Nueva recepción
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {viajesEnCamino.map((viaje) => {
              const esLlego = viaje.estado === 'LLEGO'
              const colorBar = esLlego ? 'border-l-amber-500' : 'border-l-blue-500'
              const colorBadge = esLlego ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' : 'bg-blue-100 text-blue-800 hover:bg-blue-100'

              return (
                <Card key={viaje.id} className={`overflow-hidden border-l-4 ${colorBar} shadow-sm`}>
                  <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`shrink-0 flex size-8 items-center justify-center rounded-full ${esLlego ? 'bg-amber-100' : 'bg-blue-100'}`}>
                        <Truck className={`size-4 ${esLlego ? 'text-amber-600' : 'text-blue-600'}`} />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="font-mono text-sm truncate">{viaje.codigo}</CardTitle>
                        {viaje.origen && viaje.destino && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            <MapPin className="size-3 inline mr-0.5" />
                            {viaje.origen.nombre} → {viaje.destino.nombre}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge className={`shrink-0 ${colorBadge}`}>
                      {formatEstadoViaje(viaje.estado)}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      {viaje.conductor && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="size-3.5 shrink-0" />
                          <span className="truncate">{viaje.conductor}</span>
                        </div>
                      )}
                      {viaje.vehiculo && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Package className="size-3.5 shrink-0" />
                          <span className="truncate">{viaje.vehiculo}</span>
                        </div>
                      )}
                      {viaje.fechaEstimada && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="size-3.5 shrink-0" />
                          <span>Llegada: {new Date(viaje.fechaEstimada).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => {
                        setRecepcionarViajeId(viaje.id)
                        setFormOpen(true)
                      }}
                    >
                      <CheckCircle className="size-4 mr-2" />
                      Marcar recibido
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por viaje o responsable..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            {filtered.length} recepción(es) encontrada(s)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Viaje</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Observaciones</TableHead>
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
                    No hay recepciones registradas
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((rec) => (
                  <TableRow key={rec.id}>
                    <TableCell className="text-xs">{rec.id}</TableCell>
                    <TableCell className="text-xs">
                      {new Date(rec.fecha).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{rec.viaje?.codigo ?? '-'}</TableCell>
                    <TableCell>{rec.responsable?.nombre ?? '-'}</TableCell>
                    <TableCell className="max-w-[250px] truncate">{rec.observaciones ?? '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          if (confirm('¿Eliminar esta recepción?')) {
                            deleteMutation.mutate(rec.id)
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
