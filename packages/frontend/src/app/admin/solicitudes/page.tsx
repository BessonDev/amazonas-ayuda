'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Trash2, Eye, Tag, User, MapPin, Calendar, Activity, AlertTriangle, ClipboardList, Settings2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { SolicitudForm } from './solicitud-form'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useRole } from '@/hooks/use-role'

interface Solicitud {
  id: number
  titulo: string
  descripcion: string | null
  prioridad: string
  estado: string
  createdAt: string
  campania?: { nombre: string }
  ubicacion?: { nombre: string }
  detalles?: Array<{ meta: number; recibido: number }>
}

const prioridadVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  BAJA: 'secondary',
  MEDIA: 'default',
  ALTA: 'destructive',
  URGENTE: 'destructive',
}

const PRIORIDADES = ['BAJA', 'MEDIA', 'ALTA', 'URGENTE'] as const

export default function SolicitudesPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [filtroPrioridad, setFiltroPrioridad] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { canDelete } = useRole()

  const [confirmState, setConfirmState] = useState<{
    open: boolean
    title: string
    description: string
    variant?: 'destructive' | 'default'
    onConfirm: () => void
  } | null>(null)

  const { data: solicitudes = [], isLoading } = useQuery({
    queryKey: ['solicitudes'],
    queryFn: () => api.get<Solicitud[]>('/solicitudes'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/solicitudes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitudes'] })
      toast.success('Solicitud eliminada')
    },
  })

  const filtered = solicitudes.filter((s) => {
    if (filtroPrioridad && s.prioridad !== filtroPrioridad) return false
    return (
      s.titulo.toLowerCase().includes(search.toLowerCase()) ||
      (s.descripcion ?? '').toLowerCase().includes(search.toLowerCase())
    )
  })

  const calcProgreso = (s: Solicitud) => {
    if (!s.detalles || s.detalles.length === 0) return 0
    const totalSoli = s.detalles.reduce((a, d) => a + d.meta, 0)
    const totalRecib = s.detalles.reduce((a, d) => a + d.recibido, 0)
    if (totalSoli === 0) return 0
    return Math.min(Math.round((totalRecib / totalSoli) * 100), 100)
  }

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
            placeholder="Buscar por título o descripción..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {PRIORIDADES.map((pri) => (
          <Button
            key={pri}
            variant={filtroPrioridad === pri ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFiltroPrioridad(filtroPrioridad === pri ? null : pri)}
          >
            <AlertTriangle className="size-3.5 mr-1.5" />
            {pri}
          </Button>
        ))}
        {filtroPrioridad && (
          <Button variant="ghost" size="sm" onClick={() => setFiltroPrioridad(null)}>
            Limpiar filtro
          </Button>
        )}
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
                <TableHead><ClipboardList className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Título</TableHead>
                <TableHead><AlertTriangle className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Prioridad</TableHead>
                <TableHead><Activity className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Estado</TableHead>
                <TableHead><ClipboardList className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Campaña</TableHead>
                <TableHead><MapPin className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Ubicación</TableHead>
                <TableHead><Calendar className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Fecha</TableHead>
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
                    No hay solicitudes registradas
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((sol) => {
                  const prog = calcProgreso(sol)
                  return (
                    <TableRow
                      key={sol.id}
                      className="cursor-pointer"
                      onClick={() => router.push(`/admin/solicitudes/${sol.id}`)}
                    >
                      <TableCell className="font-medium max-w-[220px]">
                        <div className="truncate">{sol.titulo}</div>
                        {sol.detalles && sol.detalles.length > 0 && (
                          <div className="flex items-center gap-2 mt-1.5">
                            <Progress value={prog} className="h-1.5 w-20" />
                            <span className="text-xs text-muted-foreground tabular-nums">{prog}%</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={prioridadVariants[sol.prioridad] ?? 'outline'}>
                          {sol.prioridad}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{sol.estado}</Badge>
                      </TableCell>
                      <TableCell>{sol.campania?.nombre ?? '-'}</TableCell>
                      <TableCell>{sol.ubicacion?.nombre ?? '-'}</TableCell>
                      <TableCell className="text-xs">
                        {new Date(sol.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={(e) => { e.stopPropagation(); router.push(`/admin/solicitudes/${sol.id}`) }}
                          >
                            <Eye className="size-4" />
                          </Button>
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={(e) => { e.stopPropagation(); setConfirmState({
                                open: true,
                                title: 'Eliminar solicitud',
                                description: `¿Estás seguro de eliminar la solicitud "${sol.titulo}"? Esta acción no se puede deshacer.`,
                                onConfirm: () => deleteMutation.mutate(sol.id),
                              })}}
                            >
                              <Trash2 className="size-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
