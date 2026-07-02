'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Edit, Trash2, ClipboardList, FileText, Calendar, Activity, Settings2 } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CampaniaForm } from './campania-form'
import { useRole } from '@/hooks/use-role'

interface Campania {
  id: number
  nombre: string
  descripcion: string | null
  fechaInicio: string
  fechaFin: string | null
  estado: string
  objetivo: string | null
}

const badgeVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  ACTIVA: 'default',
  PLANIFICADA: 'secondary',
  PAUSADA: 'outline',
  FINALIZADA: 'secondary',
  CANCELADA: 'destructive',
}

const estadoLabel: Record<string, string> = {
  ACTIVA: 'Activa',
  PLANIFICADA: 'Planificada',
  PAUSADA: 'Pausada',
  FINALIZADA: 'Finalizada',
  CANCELADA: 'Cancelada',
}

export default function CampaniasPage() {
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [selected, setSelected] = useState<Campania | null>(null)
  const queryClient = useQueryClient()
  const { canManage, canDelete } = useRole()

  const { data: campanias = [], isLoading } = useQuery({
    queryKey: ['campanias'],
    queryFn: () => api.get<Campania[]>('/campanias'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/campanias/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campanias'] })
    },
  })

  const filtered = campanias.filter((c) =>
    c.nombre.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setSelected(null)
    setFormOpen(true)
  }

  const openEdit = (campania: Campania) => {
    setSelected(campania)
    setFormOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campañas</h1>
          <p className="text-muted-foreground">Gestión de campañas de donación</p>
        </div>
        {canManage && (
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Nueva Campaña
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
            {filtered.length} campaña(s) encontrada(s)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><ClipboardList className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Nombre</TableHead>
                <TableHead><FileText className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Descripción</TableHead>
                <TableHead><Calendar className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Fecha Inicio</TableHead>
                <TableHead><Calendar className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Fecha Fin</TableHead>
                <TableHead><Activity className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Estado</TableHead>
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
                    No hay campañas registradas
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((campania) => (
                  <TableRow key={campania.id}>
                    <TableCell className="font-medium">{campania.nombre}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {campania.descripcion ?? '-'}
                    </TableCell>
                    <TableCell>
                      {new Date(campania.fechaInicio).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {campania.fechaFin
                        ? new Date(campania.fechaFin).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={badgeVariant[campania.estado] ?? 'secondary'}>
                        {estadoLabel[campania.estado] ?? campania.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {canManage && (
                          <Button variant="ghost" size="icon-sm" onClick={() => openEdit(campania)}>
                            <Edit className="size-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => {
                              if (confirm('¿Eliminar esta campaña?')) {
                                deleteMutation.mutate(campania.id)
                              }
                            }}
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

      <CampaniaForm
        open={formOpen}
        onOpenChange={setFormOpen}
        campania={selected}
      />
    </div>
  )
}
