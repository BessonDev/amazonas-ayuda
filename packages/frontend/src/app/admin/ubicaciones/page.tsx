'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Edit, Trash2, MapPin, Tags, Settings2 } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UbicacionForm } from './ubicacion-form'
import { formatTipoUbicacion } from '@/lib/enums'
import { useRole } from '@/hooks/use-role'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface Ubicacion {
  id: number
  nombre: string
  direccion: string | null
  ciudad: string
  estado: string
  pais: string | null
  contacto: string | null
  telefono: string | null
  tipoId: number
  campaniaId: number
  tipo?: { id: number; nombre: string; descripcion: string | null }
}

export default function UbicacionesPage() {
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [selected, setSelected] = useState<Ubicacion | null>(null)
  const [confirmState, setConfirmState] = useState<{
    open: boolean
    title: string
    description: string
    variant?: 'destructive' | 'default'
    onConfirm: () => void
  } | null>(null)
  const queryClient = useQueryClient()
  const { canManage, canDeleteUbicaciones } = useRole()

  const { data: ubicaciones = [], isLoading } = useQuery({
    queryKey: ['ubicaciones'],
    queryFn: () => api.get<Ubicacion[]>('/ubicaciones'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/ubicaciones/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ubicaciones'] })
      toast.success('Ubicación eliminada')
    },
  })

  const filtered = ubicaciones.filter((u) =>
    u.nombre.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setSelected(null)
    setFormOpen(true)
  }

  const openEdit = (ubicacion: Ubicacion) => {
    setSelected(ubicacion)
    setFormOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ubicaciones</h1>
          <p className="text-muted-foreground">Gestión de ubicaciones de almacenamiento</p>
        </div>
        {canManage && (
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Nueva Ubicación
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            {filtered.length} ubicación(es) encontrada(s)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><MapPin className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Nombre</TableHead>
                <TableHead><MapPin className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Dirección</TableHead>
                <TableHead><Tags className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Tipo</TableHead>
                <TableHead className="text-right"><Settings2 className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No hay ubicaciones registradas
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((ubicacion) => (
                  <TableRow key={ubicacion.id}>
                    <TableCell className="font-medium">{ubicacion.nombre}</TableCell>
                    <TableCell className="max-w-[250px] truncate">
                      {ubicacion.direccion ?? '-'}
                    </TableCell>
                    <TableCell>{formatTipoUbicacion(ubicacion.tipo?.nombre ?? '')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {canManage && (
                          <Button variant="ghost" size="icon-sm" onClick={() => openEdit(ubicacion)}>
                            <Edit className="size-4" />
                          </Button>
                        )}
                        {canDeleteUbicaciones && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setConfirmState({
                              open: true,
                              title: 'Eliminar ubicación',
                              description: `¿Estás seguro de eliminar la ubicación "${ubicacion.nombre}"? Esta acción no se puede deshacer.`,
                              onConfirm: () => deleteMutation.mutate(ubicacion.id),
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

      <UbicacionForm
        open={formOpen}
        onOpenChange={setFormOpen}
        ubicacion={selected}
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
    </div>
  )
}
