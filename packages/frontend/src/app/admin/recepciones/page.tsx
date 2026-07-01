'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Trash2 } from 'lucide-react'
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

export default function RecepcionesPage() {
  const [search, setSearch] = useState('')
  const queryClient = useQueryClient()

  const { data: recepciones = [], isLoading } = useQuery({
    queryKey: ['recepciones'],
    queryFn: () => api.get<Recepcion[]>('/recepciones'),
  })

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
      </div>

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
