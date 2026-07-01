import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Image } from 'lucide-react'
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

interface Viaje {
  id: number
  codigo: string
}

interface Lote {
  id: number
  codigo: string
  producto?: { nombre: string }
}

interface DetalleRow {
  key: string
  loteId: string
  cantidadRecibida: string
  cantidadFaltante: string
  cantidadDanada: string
  observaciones: string
}

interface RecepcionResponse {
  id: number
  [key: string]: unknown
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultViajeId?: number
}

function createRow(): DetalleRow {
  return { key: crypto.randomUUID(), loteId: '', cantidadRecibida: '1', cantidadFaltante: '0', cantidadDanada: '0', observaciones: '' }
}

export function RecepcionForm({ open, onOpenChange, defaultViajeId }: Props) {
  const queryClient = useQueryClient()
  const [viajeId, setViajeId] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [detalles, setDetalles] = useState<DetalleRow[]>([createRow()])
  const [error, setError] = useState('')
  const [fotoFile, setFotoFile] = useState<File | null>(null)

  const { data: viajes = [] } = useQuery<Viaje[]>({
    queryKey: ['viajes'],
    queryFn: () => api.get('/viajes'),
  })

  const { data: lotes = [] } = useQuery<Lote[]>({
    queryKey: ['lotes'],
    queryFn: () => api.get('/lotes'),
  })

  useEffect(() => {
    if (open) {
      setViajeId(defaultViajeId?.toString() ?? '')
      setObservaciones('')
      setDetalles([createRow()])
      setError('')
      setFotoFile(null)
    }
  }, [open, defaultViajeId])

  const uploadFoto = async (recepcionId: number, viajeIdNum: number) => {
    if (!fotoFile) return
    const formData = new FormData()
    formData.append('archivo', fotoFile)
    formData.append('entidadTipo', 'Recepcion')
    formData.append('entidadId', String(recepcionId))
    formData.append('viajeId', String(viajeIdNum))
    await api.postForm('/archivos/upload', formData)
  }

  const mutation = useMutation<RecepcionResponse, Error, Record<string, unknown>>({
    mutationFn: (data) =>
      api.post<RecepcionResponse>('/recepciones', data),
    onSuccess: async (recepcion: RecepcionResponse) => {
      queryClient.invalidateQueries({ queryKey: ['recepciones'] })
      queryClient.invalidateQueries({ queryKey: ['viajes'] })
      if (fotoFile && viajeId) {
        await uploadFoto(recepcion.id, Number(viajeId))
      }
      onOpenChange(false)
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  const updateDetalle = (key: string, field: keyof DetalleRow, value: string) => {
    setDetalles((prev) =>
      prev.map((d) => (d.key === key ? { ...d, [field]: value } : d))
    )
  }

  const removeDetalle = (key: string) => {
    setDetalles((prev) => prev.filter((d) => d.key !== key))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!viajeId) { setError('Selecciona un viaje'); return }

    const detallesData = detalles
      .filter((d) => d.loteId)
      .map((d) => ({
        loteId: Number(d.loteId),
        cantidadRecibida: parseInt(d.cantidadRecibida, 10) || 1,
        cantidadFaltante: parseInt(d.cantidadFaltante, 10) || 0,
        cantidadDanada: parseInt(d.cantidadDanada, 10) || 0,
        observaciones: d.observaciones.trim() || undefined,
      }))

    if (detallesData.length === 0) { setError('Agrega al menos un lote para recepcionar'); return }

    mutation.mutate({
      viajeId: Number(viajeId),
      observaciones: observaciones.trim() || undefined,
      detalles: detallesData,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Recepción</DialogTitle>
          <DialogDescription>
            Registra la recepción de un viaje con los lotes recibidos
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="viaje">Viaje</Label>
              <Select value={viajeId} onValueChange={(v) => setViajeId(v ?? '')}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string | null) => {
                      if (!value) return 'Seleccionar viaje...'
                      const v = viajes.find(v => v.id.toString() === value)
                      return v?.codigo ?? value
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {viajes.map((v) => (
                    <SelectItem key={v.id} value={v.id.toString()}>
                      {v.codigo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Input
                id="observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Notas opcionales"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Lotes recibidos</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => setDetalles((p) => [...p, createRow()])}>
                <Plus className="size-4 mr-1" />
                Agregar lote
              </Button>
            </div>

            {detalles.map((d, i) => (
              <div key={d.key} className="flex gap-2 items-start p-3 border rounded-lg">
                <div className="flex-[2] space-y-2">
                  <Label className="text-xs">Lote</Label>
                  <Select
                    value={d.loteId}
                    onValueChange={(v) => updateDetalle(d.key, 'loteId', v ?? '')}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {(value: string | null) => {
                          if (!value) return 'Seleccionar...'
                          const l = lotes.find(l => l.id.toString() === value)
                          if (!l) return value
                          return `${l.codigo}${l.producto ? ` (${l.producto.nombre})` : ''}`
                        }}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {lotes.map((l) => (
                        <SelectItem key={l.id} value={l.id.toString()}>
                          {l.codigo} {l.producto ? `(${l.producto.nombre})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-20 space-y-2">
                  <Label className="text-xs">Recibido</Label>
                  <Input
                    type="number"
                    min="0"
                    value={d.cantidadRecibida}
                    onChange={(e) => updateDetalle(d.key, 'cantidadRecibida', e.target.value)}
                  />
                </div>

                <div className="w-20 space-y-2">
                  <Label className="text-xs">Faltante</Label>
                  <Input
                    type="number"
                    min="0"
                    value={d.cantidadFaltante}
                    onChange={(e) => updateDetalle(d.key, 'cantidadFaltante', e.target.value)}
                  />
                </div>

                <div className="w-20 space-y-2">
                  <Label className="text-xs">Dañado</Label>
                  <Input
                    type="number"
                    min="0"
                    value={d.cantidadDanada}
                    onChange={(e) => updateDetalle(d.key, 'cantidadDanada', e.target.value)}
                  />
                </div>

                <div className="flex-[1.5] space-y-2">
                  <Label className="text-xs">Observaciones</Label>
                  <Input
                    value={d.observaciones}
                    onChange={(e) => updateDetalle(d.key, 'observaciones', e.target.value)}
                    placeholder="Opcional"
                  />
                </div>

                {detalles.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="mt-6 shrink-0"
                    onClick={() => removeDetalle(d.key)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t pt-4">
            <Label className="flex items-center gap-2 text-base font-medium">
              <Image className="size-4.5 text-[#1B4332]" />
              Foto de la recepción (opcional)
            </Label>
            <input
              type="file"
              accept="image/*"
              className="text-sm w-full"
              onChange={(e) => setFotoFile(e.target.files?.[0] ?? null)}
            />
            {fotoFile && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <Image className="size-3.5" /> {fotoFile.name}
              </p>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600 font-medium">{error}</p>
          )}

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancelar
            </DialogClose>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Guardando...' : 'Crear recepción'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
