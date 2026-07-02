'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Edit, Trash2, Tags, FileText, Settings2 } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRole } from '@/hooks/use-role'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CategoriaForm } from './categoria-form'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface Categoria {
  id: number
  nombre: string
  descripcion: string | null
}

export default function CategoriasPage() {
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [selected, setSelected] = useState<Categoria | null>(null)
  const [confirmState, setConfirmState] = useState<{
    open: boolean
    title: string
    description: string
    variant?: 'destructive' | 'default'
    onConfirm: () => void
  } | null>(null)
  const queryClient = useQueryClient()
  const { canManage, canDelete } = useRole()

  const { data: categorias = [], isLoading } = useQuery({
    queryKey: ['categorias'],
    queryFn: () => api.get<Categoria[]>('/categorias'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/categorias/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] })
      toast.success('Categoría eliminada')
    },
  })

  const filtered = categorias.filter((c) =>
    c.nombre.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setSelected(null)
    setFormOpen(true)
  }

  const openEdit = (categoria: Categoria) => {
    setSelected(categoria)
    setFormOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categorías</h1>
          <p className="text-muted-foreground">Gestión de categorías de productos</p>
        </div>
        {canManage && (
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Nueva Categoría
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
            {filtered.length} categoría(s) encontrada(s)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><Tags className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Nombre</TableHead>
                <TableHead><FileText className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Descripción</TableHead>
                <TableHead className="text-right"><Settings2 className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    No hay categorías registradas
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((categoria) => (
                  <TableRow key={categoria.id}>
                    <TableCell className="font-medium">{categoria.nombre}</TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {categoria.descripcion ?? '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {canManage && (
                          <Button variant="ghost" size="icon-sm" onClick={() => openEdit(categoria)}>
                            <Edit className="size-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setConfirmState({
                              open: true,
                              title: 'Eliminar categoría',
                              description: `¿Estás seguro de eliminar la categoría "${categoria.nombre}"? Esta acción no se puede deshacer.`,
                              onConfirm: () => deleteMutation.mutate(categoria.id),
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

      <CategoriaForm
        open={formOpen}
        onOpenChange={setFormOpen}
        categoria={selected}
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
