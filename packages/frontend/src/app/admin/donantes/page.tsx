'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Donante {
  id: number
  nombre: string
  tipo: string | null
  contacto: string | null
  email: string | null
  telefono: string | null
  direccion: string | null
}

export default function DonantesPage() {
  const [search, setSearch] = useState('')
  const queryClient = useQueryClient()

  const { data: donantes = [], isLoading } = useQuery({
    queryKey: ['donantes'],
    queryFn: () => api.get<Donante[]>('/donantes'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/donantes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donantes'] })
    },
  })

  const filtered = donantes.filter((d) =>
    d.nombre.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Donantes</h1>
          <p className="text-muted-foreground">Gestión de donantes</p>
        </div>
        <Button>
          <Plus className="size-4" />
          Nuevo Donante
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
            {filtered.length} donante(s) encontrado(s)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
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
                    No hay donantes registrados
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((donante) => (
                  <TableRow key={donante.id}>
                    <TableCell className="font-medium">{donante.nombre}</TableCell>
                    <TableCell>{donante.tipo ?? '-'}</TableCell>
                    <TableCell>{donante.contacto ?? '-'}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {donante.email ?? '-'}
                    </TableCell>
                    <TableCell>{donante.telefono ?? '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-sm">
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            if (confirm('¿Eliminar este donante?')) {
                              deleteMutation.mutate(donante.id)
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
