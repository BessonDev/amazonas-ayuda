'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { formatTipoUbicacion } from '@/lib/enums'
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
import { toast } from 'sonner'

interface TipoUbicacion {
  id: number
  nombre: string
  descripcion: string | null
}

interface Campania {
  id: number
  nombre: string
}

interface Ubicacion {
  id: number
  nombre: string
  direccion: string | null
  ciudad: string
  estado: string
  pais: string | null
  contacto: string | null
  telefono: string | null
  tipoId: number
  campaniaId: number
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  ubicacion?: Ubicacion | null
}

const CIUDADES_AMAZONAS = [
  'Puerto Ayacucho',
  'Maroa',
  'La Esmeralda',
  'San Fernando de Atabapo',
  'Casiquiare',
  'San Carlos de Río Negro',
  'Timotes',
  'Piacoa',
]

const TIPOS_VALIDOS = ['CENTRO_ACOPIO', 'HOSPITAL', 'REFUGIO', 'IGLESIA', 'COMUNIDAD', 'OTRO']

export function UbicacionForm({ open, onOpenChange, ubicacion }: Props) {
  const editando = !!ubicacion
  const queryClient = useQueryClient()
  const [nombre, setNombre] = useState('')
  const [direccion, setDireccion] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [estado, setEstado] = useState('Amazonas')
  const [pais, setPais] = useState('Venezuela')
  const [contacto, setContacto] = useState('')
  const [telefono, setTelefono] = useState('')
  const [tipoId, setTipoId] = useState('')
  const [campaniaId, setCampaniaId] = useState('')
  const [error, setError] = useState('')

  const { data: tipos = [] } = useQuery<TipoUbicacion[]>({
    queryKey: ['tipos-ubicacion'],
    queryFn: () => api.get('/ubicaciones/tipos'),
  })

  const { data: campanias = [] } = useQuery<Campania[]>({
    queryKey: ['campanias'],
    queryFn: () => api.get('/campanias'),
  })

  useEffect(() => {
    if (open) {
      setNombre(ubicacion?.nombre ?? '')
      setDireccion(ubicacion?.direccion ?? '')
      setCiudad(ubicacion?.ciudad ?? '')
      setEstado(ubicacion?.estado ?? 'Amazonas')
      setPais(ubicacion?.pais ?? 'Venezuela')
      setContacto(ubicacion?.contacto ?? '')
      setTelefono(ubicacion?.telefono ?? '')
      setTipoId(ubicacion?.tipoId?.toString() ?? '')
      setCampaniaId(ubicacion?.campaniaId?.toString() ?? '')
      setError('')
    }
  }, [open, ubicacion])

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      editando
        ? api.patch(`/ubicaciones/${ubicacion!.id}`, data)
        : api.post('/ubicaciones', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ubicaciones'] })
      toast.success(editando ? 'Ubicación actualizada' : 'Ubicación creada')
      onOpenChange(false)
    },
    onError: (err: Error) => {
      setError(err.message)
      toast.error(err.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) {
      setError('El nombre es obligatorio')
      return
    }
    if (!ciudad) {
      setError('Selecciona una ciudad')
      return
    }
    if (!estado.trim()) {
      setError('El estado es obligatorio')
      return
    }
    if (!tipoId) {
      setError('Selecciona un tipo de ubicación')
      return
    }
    if (!campaniaId) {
      setError('Selecciona una campaña')
      return
    }
    mutation.mutate({
      nombre: nombre.trim(),
      direccion: direccion.trim() || undefined,
      ciudad,
      estado: estado.trim(),
      pais: pais.trim() || undefined,
      contacto: contacto.trim() || undefined,
      telefono: telefono.trim() || undefined,
      tipoId: Number(tipoId),
      campaniaId: Number(campaniaId),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editando ? 'Editar' : 'Nueva'} Ubicación</DialogTitle>
          <DialogDescription>
            {editando ? 'Modifica los datos de la ubicación' : 'Registra una nueva ubicación de almacenamiento'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Centro de Acopio Principal"
                required
                autoFocus
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Dirección física"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ciudad">Ciudad *</Label>
              <Select value={ciudad} onValueChange={(v) => setCiudad(v ?? '')}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string | null) => {
                      if (!value) return 'Seleccionar ciudad...'
                      return value
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {CIUDADES_AMAZONAS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado *</Label>
              <Input
                id="estado"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                placeholder="Ej: Amazonas"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pais">País</Label>
              <Input
                id="pais"
                value={pais}
                onChange={(e) => setPais(e.target.value)}
              />
            </div>

            <div className="space-y-2" />

            <div className="space-y-2">
              <Label htmlFor="contacto">Persona de contacto</Label>
              <Input
                id="contacto"
                value={contacto}
                onChange={(e) => setContacto(e.target.value)}
                placeholder="Nombre del encargado"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Número de contacto"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de ubicación</Label>
              <Select value={tipoId} onValueChange={(v) => setTipoId(v ?? '')}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string | null) => {
                      if (!value) return 'Seleccionar tipo...'
                      const t = tipos.find(t => t.id.toString() === value)
                      return t ? formatTipoUbicacion(t.nombre) : value
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {tipos.filter((t) => TIPOS_VALIDOS.includes(t.nombre)).map((t) => (
                    <SelectItem key={t.id} value={t.id.toString()}>
                      {formatTipoUbicacion(t.nombre)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="campania">Campaña</Label>
              <Select value={campaniaId} onValueChange={(v) => setCampaniaId(v ?? '')}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string | null) => {
                      if (!value) return 'Seleccionar campaña...'
                      const c = campanias.find(c => c.id.toString() === value)
                      return c?.nombre ?? value
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {campanias.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.nombre}
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
                  : 'Crear ubicación'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
