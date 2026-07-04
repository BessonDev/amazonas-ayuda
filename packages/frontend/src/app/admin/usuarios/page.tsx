'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Edit, UserX, UserCheck, User, Mail, Phone, Shield, Activity, Calendar, Settings2 } from 'lucide-react'
import { UsuarioForm } from './usuario-form'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRole } from '@/hooks/use-role'
import { Badge } from '@/components/ui/badge'
import { formatRol } from '@/lib/enums'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Usuario {
  id: number
  nombre: string
  email: string
  telefono: string | null
  activo: boolean
  ultimoAcceso: string | null
  createdAt: string
  rol: { id: number; nombre: string }
  ubicacionId?: number | null
}

export default function UsuariosPage() {
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editUser, setEditUser] = useState<Usuario | undefined>()
  const queryClient = useQueryClient()

  const { data: usuarios = [], isLoading } = useQuery<Usuario[]>({
    queryKey: ['usuarios'],
    queryFn: () => api.get('/usuarios'),
  })

  const { isAdmin } = useRole()

  const [confirmState, setConfirmState] = useState<{
    open: boolean
    title: string
    description: string
    variant?: 'destructive' | 'default'
    onConfirm: () => void
  } | null>(null)

  const desactivarMutation = useMutation({
    mutationFn: (id: number) => api.patch(`/usuarios/${id}/desactivar`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      toast.success('Estado de usuario actualizado')
    },
  })

  const filtered = usuarios.filter((u) =>
    u.nombre.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.rol.nombre.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>
          <p className="text-muted-foreground">Gestión de usuarios del sistema</p>
        </div>
        {isAdmin && (
          <Button onClick={() => { setEditUser(undefined); setFormOpen(true) }}>
            <Plus className="size-4 mr-2" />
            Nuevo usuario
          </Button>
        )}
      </div>

      <UsuarioForm open={formOpen} onOpenChange={setFormOpen} editUser={editUser} />

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

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email o rol..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            {filtered.length} usuario(s) encontrado(s)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><User className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Nombre</TableHead>
                <TableHead><Mail className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Email</TableHead>
                <TableHead><Phone className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Teléfono</TableHead>
                <TableHead><Shield className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Rol</TableHead>
                <TableHead><Activity className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Estado</TableHead>
                <TableHead><Calendar className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Último acceso</TableHead>
                <TableHead className="text-right"><Settings2 className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Acciones</TableHead>
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
                    No hay usuarios registrados
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.nombre}</TableCell>
                    <TableCell className="text-xs">{u.email}</TableCell>
                    <TableCell className="text-xs">{u.telefono ?? '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{formatRol(u.rol.nombre)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.activo ? 'default' : 'secondary'}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {u.ultimoAcceso ? new Date(u.ultimoAcceso).toLocaleDateString() : 'Nunca'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => { setEditUser({ ...u, ubicacionId: u.ubicacionId }); setFormOpen(true) }}
                          >
                            <Edit className="size-4" />
                          </Button>
                        )}
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setConfirmState({
                              open: true,
                              title: u.activo ? 'Desactivar usuario' : 'Activar usuario',
                              description: `¿Estás seguro de ${u.activo ? 'desactivar' : 'activar'} al usuario "${u.nombre}"?`,
                              variant: 'default',
                              onConfirm: () => desactivarMutation.mutate(u.id),
                            })}
                          >
                            {u.activo
                              ? <UserX className="size-4 text-destructive" />
                              : <UserCheck className="size-4 text-green-600" />
                            }
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
    </div>
  )
}
