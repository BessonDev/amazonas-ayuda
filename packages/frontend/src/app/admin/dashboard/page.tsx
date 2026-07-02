'use client'

import { useQuery } from '@tanstack/react-query'
import {
  Truck, ClipboardList, Package, CheckCircle2,
  AlertTriangle, MapPin, Tags, ShoppingCart, Users,
  FileText, Settings, LayoutDashboard,
} from 'lucide-react'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const kpiStyles = {
  warning: { border: 'border-amber-200 dark:border-amber-800', bg: 'bg-amber-50 dark:bg-amber-950/20', icon: 'text-amber-600' },
  danger: { border: 'border-red-200 dark:border-red-800', bg: 'bg-red-50 dark:bg-red-950/20', icon: 'text-red-600' },
  success: { border: 'border-emerald-200 dark:border-emerald-800', bg: 'bg-emerald-50 dark:bg-emerald-950/20', icon: 'text-emerald-600' },
  default: { border: 'border-border', bg: 'bg-muted/50', icon: 'text-primary' },
}

export default function DashboardPage() {
  const { data: viajes = [] } = useQuery<any[]>({
    queryKey: ['viajes-kpi'],
    queryFn: () => api.get('/viajes'),
  })

  const { data: solicitudes = [] } = useQuery<any[]>({
    queryKey: ['solicitudes-kpi'],
    queryFn: () => api.get('/solicitudes'),
  })

  const { data: lotes = [] } = useQuery<any[]>({
    queryKey: ['lotes-kpi'],
    queryFn: () => api.get('/lotes'),
  })

  const enTransito = viajes.filter((v) => v.estado === 'EN_TRANSITO').length
  const urgentes = solicitudes.filter(
    (s) => (s.prioridad === 'URGENTE' || s.prioridad === 'ALTA') && (s.estado === 'ABIERTA' || s.estado === 'EN_PROCESO'),
  ).length
  const disponibles = lotes.filter((l) => l.estado === 'DISPONIBLE').length
  const completados = viajes.filter((v) => v.estado === 'COMPLETADO' || v.estado === 'RECEPCION_PARCIAL').length

  const kpis: Array<{
    label: string; value: number; icon: typeof Truck; href: string;
    subtitle: string; variant: keyof typeof kpiStyles
  }> = [
    {
      label: 'Viajes en tránsito', value: enTransito, icon: Truck, href: '/admin/viajes',
      subtitle: 'Requieren seguimiento', variant: enTransito > 0 ? 'warning' : 'default',
    },
    {
      label: 'Solicitudes urgentes', value: urgentes, icon: AlertTriangle, href: '/admin/solicitudes',
      subtitle: urgentes > 0 ? 'Requieren atención inmediata' : 'Ninguna pendiente',
      variant: urgentes > 0 ? 'danger' : 'success',
    },
    {
      label: 'Lotes disponibles', value: disponibles, icon: Package, href: '/admin/lotes',
      subtitle: 'Listos para asignar', variant: 'success',
    },
    {
      label: 'Viajes completados', value: completados, icon: CheckCircle2, href: '/admin/viajes',
      subtitle: 'Este período', variant: 'default',
    },
  ]

  const quickAccess = [
    { label: 'Campañas', href: '/admin/campanias', icon: ClipboardList },
    { label: 'Ubicaciones', href: '/admin/ubicaciones', icon: MapPin },
    { label: 'Categorías', href: '/admin/categorias', icon: Tags },
    { label: 'Productos', href: '/admin/productos', icon: Package },
    { label: 'Donantes', href: '/admin/donantes', icon: Users },
    { label: 'Movimientos', href: '/admin/movimientos', icon: ShoppingCart },
    { label: 'Archivos', href: '/admin/archivos', icon: FileText },
    { label: 'Usuarios', href: '/admin/usuarios', icon: Settings },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Panel de Control</h1>
        <p className="text-muted-foreground">Resumen operativo del sistema de donaciones</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          const s = kpiStyles[kpi.variant]
          return (
            <a key={kpi.label} href={kpi.href} className="block">
              <Card className={`relative overflow-hidden transition-all hover:shadow-md cursor-pointer border-2 ${s.border}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.label}</CardTitle>
                    <Icon className={`size-5 ${s.icon}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{kpi.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{kpi.subtitle}</p>
                </CardContent>
              </Card>
            </a>
          )
        })}
      </div>

      <div>
        <h2 className="text-lg font-semibold tracking-tight mb-4">Acceso rápido</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickAccess.map((item) => {
            const Icon = item.icon
            return (
              <a key={item.label} href={item.href} className="block">
                <Card className="relative overflow-hidden transition-colors hover:bg-muted/50 cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between py-3">
                    <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
                    <Icon className="size-4 text-muted-foreground" />
                  </CardHeader>
                </Card>
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}
