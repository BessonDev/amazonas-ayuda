'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Package, MapPin, Tags, Hash, ChevronDown, ChevronUp, FileDown, Loader2, Warehouse } from 'lucide-react'
import { api } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

interface InventarioItem {
  productoId: number
  producto: string
  categoria: string
  ubicacionId: number
  ubicacion: string
  cantidad: number
  numLotes: number
  lotes: string[]
}

interface Ubicacion {
  id: number
  nombre: string
}

export default function InventarioPage() {
  const [search, setSearch] = useState('')
  const [ubicacionId, setUbicacionId] = useState('')
  const [expandLotes, setExpandLotes] = useState<Set<string>>(new Set())

  const { data: ubicaciones = [] } = useQuery<Ubicacion[]>({
    queryKey: ['ubicaciones'],
    queryFn: () => api.get('/ubicaciones'),
  })

  const { data: items = [], isLoading } = useQuery<InventarioItem[]>({
    queryKey: ['inventario', ubicacionId],
    queryFn: () => {
      const params = new URLSearchParams()
      if (ubicacionId) params.set('ubicacionId', ubicacionId)
      return api.get(`/inventario?${params}`)
    },
  })

  const filtered = items.filter((item) =>
    item.producto.toLowerCase().includes(search.toLowerCase()),
  )

  const totalCantidad = filtered.reduce((sum, i) => sum + i.cantidad, 0)
  const totalLotes = filtered.reduce((sum, i) => sum + i.numLotes, 0)
  const ubicacionesActivas = ubicaciones.filter((u) =>
    items.some((i) => i.ubicacionId === u.id),
  )

  const [loadingPdf, setLoadingPdf] = useState(false)

  const downloadPDF = async () => {
    setLoadingPdf(true)
    try {
      const params = new URLSearchParams()
      if (ubicacionId) params.set('ubicacionId', ubicacionId)
      const blob = await api.downloadBlob(`/inventario/pdf?${params}`)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `inventario${ubicacionId ? `-${ubicaciones.find((u) => u.id.toString() === ubicacionId)?.nombre.toLowerCase().replace(/\s+/g, '-')}` : '-general'}-${new Date().toISOString().slice(0, 10)}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      // silently fail
    } finally {
      setLoadingPdf(false)
    }
  }

  const toggleExpand = (key: string) => {
    setExpandLotes((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Resumen de Inventario</h1>
        <p className="text-muted-foreground">
          Stock disponible en centros de acopio — solo lotes DISPONIBLE
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por producto..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={ubicacionId} onValueChange={(v) => setUbicacionId(v ?? '')}>
          <SelectTrigger className="w-64">
            <SelectValue>
              {(value: string | null) => {
                if (!value) return 'Todas las ubicaciones'
                const u = ubicaciones.find((u) => u.id.toString() === value)
                return u?.nombre ?? value
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas las ubicaciones</SelectItem>
            {ubicaciones.map((u) => (
              <SelectItem key={u.id} value={u.id.toString()}>
                {u.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="default"
          disabled={loadingPdf}
          onClick={downloadPDF}
          className="gap-1.5"
        >
          {loadingPdf ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <FileDown className="size-4" />
          )}
          PDF
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {filtered.length} producto(s) en {ubicacionId ? 1 : `${ubicacionesActivas.length} ubicación(es)`}
            {' — '}
            <span className="font-semibold text-foreground">{totalCantidad}</span> unidades en{' '}
            <span className="font-semibold text-foreground">{totalLotes}</span> lote(s)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><Package className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Producto</TableHead>
                <TableHead><Tags className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Categoría</TableHead>
                <TableHead className="text-center"><Warehouse className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Stock</TableHead>
                <TableHead><Tags className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Lotes</TableHead>
                <TableHead className="text-right"><Hash className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" /></TableHead>
                <TableHead><MapPin className="size-3.5 inline mr-1.5 -mt-0.5 text-muted-foreground" />Ubicación</TableHead>
                <TableHead className="w-10"></TableHead>
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
                    No hay inventario disponible
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item) => {
                  const key = `${item.productoId}-${item.ubicacionId}`
                  const expanded = expandLotes.has(key)
                  return (
                    <TableRow key={key}>
                      <TableCell className="font-medium">{item.producto}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{item.categoria}</Badge>
                      </TableCell>
                      <TableCell className="text-center font-medium tabular-nums">
                        {item.cantidad}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {(expanded ? item.lotes : item.lotes.slice(0, 3)).map((lote) => (
                            <Badge key={lote} variant="secondary" className="font-mono text-[10px]">
                              {lote}
                            </Badge>
                          ))}
                          {item.lotes.length > 3 && !expanded && (
                            <button
                              type="button"
                              className="text-[10px] text-muted-foreground hover:text-foreground underline underline-offset-2 cursor-pointer self-center transition-colors"
                              onClick={() => toggleExpand(key)}
                            >
                              +{item.lotes.length - 3} más
                            </button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {item.numLotes}
                      </TableCell>
                      <TableCell className="text-sm">{item.ubicacion}</TableCell>
                      <TableCell>
                        {item.lotes.length > 3 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => toggleExpand(key)}
                          >
                            {expanded
                              ? <ChevronUp className="size-3.5" />
                              : <ChevronDown className="size-3.5" />
                            }
                          </Button>
                        )}
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
