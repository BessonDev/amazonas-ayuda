'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Trash2 } from 'lucide-react'
import { SolicitudForm } from './solicitud-form'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Solicitud {
  id: number
  titulo: string
  descripcion: string | null
  prioridad: string
  estado: string
  createdAt: string
  campania?: { nombre: string }
  ubicacion?: { nombre: string }
}

const prioridadVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  BAJA: 'secondary',
  MEDIA: 'default',
  ALTA: 'destructive',
  URGENTE: 'destructive',
}

const estadoVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  ABIERTA: 'default',
  EN_PROCESO: 'outline',
  COMPLETADA: 'secondary',
  CANCELADA: 'destructive',
}

export default function SolicitudesPage() {
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: solicitudes = [], isLoading } = useQuery({
    queryKey: ['solicitudes'],
    queryFn: () => api.get<Solicitud[]>('/solicitudes'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/solicitudes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitudes'] })
    },
  })

  const filtered = solicitudes.filter((s) =>
    s.titulo.toLowerCase().includes(search.toLowerCase()) ||
    (s.descripcion ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Solicitudes</h1>
          <p className="text-muted-foreground">Gestión de solicitudes de recursos</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="size-4 mr-2" />
          Nueva solicitud
        </Button>
      </div>

      <SolicitudForm open={formOpen} onOpenChange={setFormOpen} />

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título o descripción..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            {filtered.length} solicitud(es) encontrada(s)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Campaña</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
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
                    No hay solicitudes registradas
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((sol) => (
                  <TableRow key={sol.id}>
                    <TableCell className="font-medium max-w-[250px] truncate">{sol.titulo}</TableCell>
                    <TableCell>
                      <Badge variant={prioridadVariants[sol.prioridad] ?? 'outline'}>
                        {sol.prioridad}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={estadoVariants[sol.estado] ?? 'outline'}>
                        {sol.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>{sol.campania?.nombre ?? '-'}</TableCell>
                    <TableCell>{sol.ubicacion?.nombre ?? '-'}</TableCell>
                    <TableCell className="text-xs">
                      {new Date(sol.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          if (confirm('¿Eliminar esta solicitud?')) {
                            deleteMutation.mutate(sol.id)
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
