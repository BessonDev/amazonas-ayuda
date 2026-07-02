'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Edit, Trash2, User, Tags, Phone, Settings2 } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRole } from '@/hooks/use-role'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DonanteForm } from './donante-form'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { formatTipoDonante } from '@/lib/enums'

interface Donante {
  id: number
  nombre: string | null
  tipo: string | null
  telefono: string | null
}

export default function DonantesPage() {
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [selected, setSelected] = useState<Donante | null>(null)
  const [confirmState, setConfirmState] = useState<{
    open: boolean
    title: string
    description: string
    variant?: 'destructive' | 'default'
    onConfirm: () => void
  } | null>(null)
  const queryClient = useQueryClient()
  const { canManage, canDelete } = useRole()

  const { data: donantes = [], isLoading } = useQuery({
    queryKey: ['donantes'],
    queryFn: () => api.get<Donante[]>('/donantes'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/donantes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donantes'] })
      toast.success('Donante eliminado')
    },
  })

  const filtered = donantes.filter((d) =>
    (d.nombre ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (d.tipo ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setSelected(null)
    setFormOpen(true)
  }

  const openEdit = (donante: Donante) => {
    setSelected(donante)
    setFormOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Donantes</h1>
          <p className="text-muted-foreground">Gestión de donantes</p>
        </div>
        {canManage && (
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Nuevo Donante
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
            {filtered.length} donante(s) encontrado(s)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><User className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Nombre</TableHead>
                <TableHead><Tags className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Tipo</TableHead>
                <TableHead><Phone className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Teléfono</TableHead>
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
                    No hay donantes registrados
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((donante) => (
                  <TableRow key={donante.id}>
                    <TableCell className="font-medium">{donante.nombre ?? '-'}</TableCell>
                    <TableCell>{formatTipoDonante(donante.tipo ?? '')}</TableCell>
                    <TableCell>{donante.telefono ?? '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {canManage && (
                          <Button variant="ghost" size="icon-sm" onClick={() => openEdit(donante)}>
                            <Edit className="size-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setConfirmState({
                              open: true,
                              title: 'Eliminar donante',
                              description: `¿Estás seguro de eliminar al donante "${donante.nombre ?? 'Anónimo'}"? Esta acción no se puede deshacer.`,
                              onConfirm: () => deleteMutation.mutate(donante.id),
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

      <DonanteForm
        open={formOpen}
        onOpenChange={setFormOpen}
        donante={selected}
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
