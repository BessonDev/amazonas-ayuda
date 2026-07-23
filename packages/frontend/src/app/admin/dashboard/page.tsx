'use client'

import { useQuery } from '@tanstack/react-query'
import {
  Truck, ClipboardList, Package, CheckCircle2,
  AlertTriangle, MapPin, Tags, ShoppingCart, Users,
  Image as ImageIcon, Settings,
} from 'lucide-react'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRole } from '@/hooks/use-role'

const kpiVariants = {
  warning: {
    gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
    border: 'border-amber-200 dark:border-amber-800',
    icon: 'text-amber-500',
    silhouette: 'text-amber-500/10 dark:text-amber-500/15',
    value: 'text-amber-700 dark:text-amber-300',
  },
  danger: {
    gradient: 'from-red-500/10 via-red-500/5 to-transparent',
    border: 'border-red-200 dark:border-red-800',
    icon: 'text-red-500',
    silhouette: 'text-red-500/10 dark:text-red-500/15',
    value: 'text-red-700 dark:text-red-300',
  },
  success: {
    gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
    border: 'border-emerald-200 dark:border-emerald-800',
    icon: 'text-emerald-500',
    silhouette: 'text-emerald-500/10 dark:text-emerald-500/15',
    value: 'text-emerald-700 dark:text-emerald-300',
  },
  default: {
    gradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-500',
    silhouette: 'text-blue-500/10 dark:text-blue-500/15',
    value: 'text-blue-700 dark:text-blue-300',
  },
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
  const porAceptar = solicitudes.filter((s) => s.estado === 'ABIERTA').length
  const disponibles = lotes.filter((l) => l.estado === 'DISPONIBLE').length
  const completados = viajes.filter((v) => v.estado === 'COMPLETADO' || v.estado === 'RECEPCION_PARCIAL').length

    const kpis: Array<{
        label: string; value: number; icon: typeof Truck; href: string;
        subtitle: string; variant: keyof typeof kpiVariants
    }> = [
        {
            label: 'Viajes en tránsito', value: enTransito, icon: Truck, href: '/admin/viajes',
            subtitle: 'Requieren seguimiento', variant: enTransito > 0 ? 'warning' : 'default',
        },
        {
            label: 'Solicitudes por aceptar', value: porAceptar, icon: AlertTriangle, href: '/admin/solicitudes',
            subtitle: porAceptar > 0 ? 'Pendientes de aprobación' : 'Todas aprobadas',
            variant: porAceptar > 0 ? 'warning' : 'success',
        },
        {
            label: 'Stock disponible', value: disponibles, icon: Package, href: '/admin/lotes',
            subtitle: 'Listos para asignar', variant: 'success',
        },
        {
            label: 'Viajes completados', value: completados, icon: CheckCircle2, href: '/admin/viajes',
            subtitle: 'Este período', variant: 'default',
        },
    ]

  const { isAdmin, hasRole } = useRole()

  const quickAccess = [
    ...(hasRole('ADMINISTRADOR', 'COORDINADOR_LOGISTICO') ? [{ label: 'Campañas', href: '/admin/campanias', icon: ClipboardList, color: 'from-blue-500/10' }] : []),
    ...(hasRole('ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'OPERADOR_INVENTARIO') ? [
      { label: 'Ubicaciones', href: '/admin/ubicaciones', icon: MapPin, color: 'from-violet-500/10' },
      { label: 'Categorías', href: '/admin/categorias', icon: Tags, color: 'from-pink-500/10' },
      { label: 'Donantes', href: '/admin/donantes', icon: Users, color: 'from-amber-500/10' },
    ] : []),
    ...(hasRole('ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'OPERADOR_INVENTARIO', 'RESPONSABLE_DESTINO') ? [
      { label: 'Productos', href: '/admin/productos', icon: Package, color: 'from-emerald-500/10' },
    ] : []),
    ...(hasRole('ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'OPERADOR_INVENTARIO') ? [
      { label: 'Movimientos', href: '/admin/movimientos', icon: ShoppingCart, color: 'from-cyan-500/10' },
    ] : []),
    ...(hasRole('ADMINISTRADOR', 'COORDINADOR_LOGISTICO') ? [{ label: 'Imágenes', href: '/admin/archivos', icon: ImageIcon, color: 'from-orange-500/10' }] : []),
    ...(isAdmin ? [{ label: 'Usuarios', href: '/admin/usuarios', icon: Settings, color: 'from-rose-500/10' }] : []),
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Panel de Control</h1>
        <p className="text-muted-foreground">Resumen operativo de La Red Solidaria</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          const v = kpiVariants[kpi.variant]
          return (
            <a key={kpi.label} href={kpi.href} className="block group">
              <Card className={`relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer border-2 ${v.border}`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${v.gradient}`} />
                <Icon className={`absolute -bottom-3 -right-3 size-28 ${v.silhouette} transition-transform group-hover:scale-110 group-hover:rotate-3`} />
                <CardHeader className="pb-2 relative">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.label}</CardTitle>
                    <Icon className={`size-5 ${v.icon}`} />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className={`text-3xl font-bold ${v.value}`}>{kpi.value}</div>
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
              <a key={item.label} href={item.href} className="block group">
                <Card className="relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color} via-transparent to-transparent opacity-80`} />
                  <Icon className="absolute -bottom-2 -right-2 size-20 text-foreground/10 dark:text-foreground/15 transition-transform group-hover:scale-110 group-hover:rotate-3" />
                  <CardHeader className="py-3 relative">
                    <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
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
