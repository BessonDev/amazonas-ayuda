'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Trash2 } from 'lucide-react'
import { RecepcionForm } from './recepcion-form'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
            {viajesEnCamino.map((viaje) => (
              <Card key={viaje.id} className="border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="font-mono text-sm">{viaje.codigo}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-xs text-muted-foreground space-y-1">
                    {viaje.conductor && <p>Conductor: {viaje.conductor}</p>}
                    {viaje.vehiculo && <p>Vehículo: {viaje.vehiculo}</p>}
                    {viaje.origen && viaje.destino && (
                      <p>{viaje.origen.nombre} → {viaje.destino.nombre}</p>
                    )}
                    {viaje.fechaEstimada && (
                      <p>Llegada estimada: {new Date(viaje.fechaEstimada).toLocaleDateString()}</p>
                    )}
                  </div>
                  <Button
                    className="w-full mt-2"
                    onClick={() => {
                      setRecepcionarViajeId(viaje.id)
                      setFormOpen(true)
                    }}
                  >
                    Receptionar
                  </Button>
                </CardContent>
              </Card>
            ))}
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
