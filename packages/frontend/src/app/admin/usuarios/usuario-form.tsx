'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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

const ROLES = [
  { id: 1, nombre: 'ADMINISTRADOR' },
  { id: 2, nombre: 'COORDINADOR_LOGISTICO' },
  { id: 3, nombre: 'OPERADOR_INVENTARIO' },
  { id: 4, nombre: 'RESPONSABLE_DESTINO' },
]

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  editUser?: { id: number; nombre: string; email: string; telefono: string | null; rol: { id: number; nombre: string } }
}

export function UsuarioForm({ open, onOpenChange, editUser }: Props) {
  const queryClient = useQueryClient()
  const esEdicion = !!editUser
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [telefono, setTelefono] = useState('')
  const [rolId, setRolId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      if (editUser) {
        setNombre(editUser.nombre)
        setEmail(editUser.email)
        setPassword('')
        setTelefono(editUser.telefono ?? '')
        setRolId(editUser.rol.id.toString())
      } else {
        setNombre('')
        setEmail('')
        setPassword('')
        setTelefono('')
        setRolId('')
      }
      setError('')
    }
  }, [open, editUser])

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      esEdicion ? api.patch(`/usuarios/${editUser!.id}`, data) : api.post('/usuarios', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      onOpenChange(false)
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) { setError('El nombre es obligatorio'); return }
    if (!email.trim()) { setError('El email es obligatorio'); return }
    if (!esEdicion && !password) { setError('La contraseña es obligatoria'); return }
    if (!rolId) { setError('Selecciona un rol'); return }

    const data: Record<string, unknown> = {
      nombre: nombre.trim(),
      email: email.trim(),
      telefono: telefono.trim() || undefined,
      rolId: Number(rolId),
    }
    if (password) data.password = password

    mutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{esEdicion ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
          <DialogDescription>
            {esEdicion ? 'Actualiza los datos del usuario' : 'Crea un nuevo usuario del sistema'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre completo" required />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" required />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="password">{esEdicion ? 'Nueva contraseña (opcional)' : 'Contraseña'}</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={esEdicion ? 'Dejar vacío para mantener' : 'Mínimo 6 caracteres'} required={!esEdicion} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Opcional" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rol">Rol</Label>
              <Select value={rolId} onValueChange={(v) => setRolId(v ?? '')}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string | null) => {
                      if (!value) return 'Seleccionar...'
                      const r = ROLES.find(r => r.id.toString() === value)
                      return r?.nombre ?? value
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.id} value={r.id.toString()}>
                      {r.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear usuario'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
