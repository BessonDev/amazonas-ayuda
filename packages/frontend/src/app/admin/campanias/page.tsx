'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Campania {
  id: number
  nombre: string
  descripcion: string | null
  fechaInicio: string
  fechaFin: string | null
  activa: boolean
}

export default function CampaniasPage() {
  const [search, setSearch] = useState('')
  const queryClient = useQueryClient()

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campañas</h1>
          <p className="text-muted-foreground">Gestión de campañas de donación</p>
        </div>
        <Button>
          <Plus className="size-4" />
          Nueva Campaña
        </Button>
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
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Fecha Inicio</TableHead>
                <TableHead>Fecha Fin</TableHead>
                <TableHead>Activa</TableHead>
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
                      <Badge variant={campania.activa ? 'default' : 'secondary'}>
                        {campania.activa ? 'Sí' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-sm">
                          <Edit className="size-4" />
                        </Button>
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
