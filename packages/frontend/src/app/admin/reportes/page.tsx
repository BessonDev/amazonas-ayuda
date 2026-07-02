'use client'

import { useState } from 'react'
import { FileDown, Package, Gift, Truck, Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

type Formato = 'pdf' | 'excel'

interface ReporteInfo {
  id: string
  titulo: string
  descripcion: string
  icono: typeof Package
  color: string
  bgColor: string
}

const REPORTES: ReporteInfo[] = [
  {
    id: 'inventario',
    titulo: 'Inventario',
    descripcion: 'Stock actual por ubicación y producto, con cantidades disponibles y saldos por categoría.',
    icono: Package,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
  {
    id: 'donaciones',
    titulo: 'Donaciones',
    descripcion: 'Donaciones recibidas agrupadas por campaña, donante y producto, con fechas y montos.',
    icono: Gift,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
  },
  {
    id: 'viajes',
    titulo: 'Viajes',
    descripcion: 'Todos los viajes realizados con detalle de rutas, responsables, lotes transportados y estados.',
    icono: Truck,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
  },
]

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function formatFilename(reporte: string, formato: Formato): string {
  const ext = formato === 'pdf' ? 'pdf' : 'xlsx'
  const date = new Date().toISOString().slice(0, 10)
  return `reporte-${reporte}-${date}.${ext}`
}

export default function ReportesPage() {
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const generar = async (reporteId: string, formato: Formato) => {
    const key = `${reporteId}-${formato}`
    setLoading((prev) => ({ ...prev, [key]: true }))

    try {
      const blob = await api.downloadBlob(`/reportes/${reporteId}?formato=${formato}`)
      downloadBlob(blob, formatFilename(reporteId, formato))
      toast.success(`${formato === 'pdf' ? 'PDF' : 'Excel'} de ${REPORTES.find(r => r.id === reporteId)?.titulo ?? reporteId} descargado`)
    } catch {
      toast.error(`Error al generar reporte de ${REPORTES.find(r => r.id === reporteId)?.titulo ?? reporteId}`)
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reportes</h1>
        <p className="text-muted-foreground">Genera y descarga reportes en PDF o Excel</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {REPORTES.map((reporte) => {
          const Icono = reporte.icono
          return (
            <Card key={reporte.id} className="flex flex-col">
              <CardHeader>
                <div className={`flex size-12 items-center justify-center rounded-lg ${reporte.bgColor}`}>
                  <Icono className={`size-6 ${reporte.color}`} />
                </div>
                <CardTitle className="mt-2">{reporte.titulo}</CardTitle>
                <CardDescription>{reporte.descripcion}</CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto flex gap-2">
                <Button
                  variant="default"
                  className="flex-1"
                  disabled={loading[`${reporte.id}-pdf`]}
                  onClick={() => generar(reporte.id, 'pdf')}
                >
                  {loading[`${reporte.id}-pdf`] ? (
                    <Loader2 className="size-4 mr-2 animate-spin" />
                  ) : (
                    <FileDown className="size-4 mr-2" />
                  )}
                  PDF
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={loading[`${reporte.id}-excel`]}
                  onClick={() => generar(reporte.id, 'excel')}
                >
                  {loading[`${reporte.id}-excel`] ? (
                    <Loader2 className="size-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="size-4 mr-2" />
                  )}
                  Excel
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
