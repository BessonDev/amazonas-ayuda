'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'

const UNIDADES = [
  { value: 'UNIDAD', label: 'Unidad' },
  { value: 'KILO', label: 'Kilogramo' },
  { value: 'LITRO', label: 'Litro' },
  { value: 'CAJA', label: 'Caja' },
  { value: 'BOLSA', label: 'Bolsa' },
  { value: 'PAQUETE', label: 'Paquete' },
  { value: 'GALON', label: 'Galón' },
  { value: 'TONELADA', label: 'Tonelada' },
  { value: 'PAR', label: 'Par' },
  { value: 'OTRO', label: 'Otro' },
]

interface Categoria {
  id: number
  nombre: string
}

interface Producto {
  id: number
  nombre: string
  descripcion: string | null
  unidad: string | null
  categoriaId: number
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  producto?: Producto | null
}

export function ProductoForm({ open, onOpenChange, producto }: Props) {
  const editando = !!producto
  const queryClient = useQueryClient()
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [unidad, setUnidad] = useState('UNIDAD')
  const [error, setError] = useState('')

  const { data: categorias = [] } = useQuery<Categoria[]>({
    queryKey: ['categorias'],
    queryFn: () => api.get('/categorias'),
  })

  useEffect(() => {
    if (open) {
      setNombre(producto?.nombre ?? '')
      setDescripcion(producto?.descripcion ?? '')
      setCategoriaId(producto?.categoriaId?.toString() ?? '')
      setUnidad(producto?.unidad ?? 'UNIDAD')
      setError('')
    }
  }, [open, producto])

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      editando
        ? api.patch(`/productos/${producto!.id}`, data)
        : api.post('/productos', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] })
      onOpenChange(false)
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) {
      setError('El nombre es obligatorio')
      return
    }
    if (!categoriaId) {
      setError('Selecciona una categoría')
      return
    }
    mutation.mutate({
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || undefined,
      categoriaId: Number(categoriaId),
      unidad,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editando ? 'Editar' : 'Nuevo'} Producto</DialogTitle>
          <DialogDescription>
            {editando ? 'Modifica los datos del producto' : 'Registra un nuevo producto'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Arroz"
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Input
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción opcional"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría</Label>
              <Select value={categoriaId} onValueChange={(v) => setCategoriaId(v ?? '')}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string | null) => {
                      if (!value) return 'Seleccionar...'
                      const c = categorias.find(c => c.id.toString() === value)
                      return c?.nombre ?? value
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unidad">Unidad de medida</Label>
              <Select value={unidad} onValueChange={(v) => setUnidad(v ?? 'UNIDAD')}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string | null) => {
                      if (!value) return 'Seleccionar...'
                      const u = UNIDADES.find(u => u.value === value)
                      return u?.label ?? value
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {UNIDADES.map((u) => (
                    <SelectItem key={u.value} value={u.value}>
                      {u.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 font-medium">{error}</p>
          )}

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancelar
            </DialogClose>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending
                ? 'Guardando...'
                : editando
                  ? 'Guardar cambios'
                  : 'Crear producto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
