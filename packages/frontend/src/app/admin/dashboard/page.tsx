'use client'

import { useQuery } from '@tanstack/react-query'
import { Package, MapPin, ClipboardList, Warehouse, Truck, FileText, Users, Tags } from 'lucide-react'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CountItem {
  label: string
  href: string
  icon: typeof Package
  count: number
  color: string
}

export default function DashboardPage() {
  const fetchCount = async (endpoint: string) => {
    const data = await api.get<any[]>(endpoint)
    return data?.length ?? 0
  }

  const queries = {
    campanias: useQuery({ queryKey: ['campanias-count'], queryFn: () => fetchCount('/campanias') }),
    ubicaciones: useQuery({ queryKey: ['ubicaciones-count'], queryFn: () => fetchCount('/ubicaciones') }),
    categorias: useQuery({ queryKey: ['categorias-count'], queryFn: () => fetchCount('/categorias') }),
    productos: useQuery({ queryKey: ['productos-count'], queryFn: () => fetchCount('/productos') }),
    donantes: useQuery({ queryKey: ['donantes-count'], queryFn: () => fetchCount('/donantes') }),
    lotes: useQuery({ queryKey: ['lotes-count'], queryFn: () => fetchCount('/lotes') }),
    viajes: useQuery({ queryKey: ['viajes-count'], queryFn: () => fetchCount('/viajes') }),
    solicitudes: useQuery({ queryKey: ['solicitudes-count'], queryFn: () => fetchCount('/solicitudes') }),
  }

  const items: CountItem[] = [
    { label: 'Campañas', href: '/admin/campanias', icon: ClipboardList, count: queries.campanias.data ?? 0, color: 'text-blue-600' },
    { label: 'Ubicaciones', href: '/admin/ubicaciones', icon: MapPin, count: queries.ubicaciones.data ?? 0, color: 'text-emerald-600' },
    { label: 'Categorías', href: '/admin/categorias', icon: Tags, count: queries.categorias.data ?? 0, color: 'text-violet-600' },
    { label: 'Productos', href: '/admin/productos', icon: Package, count: queries.productos.data ?? 0, color: 'text-amber-600' },
    { label: 'Donantes', href: '/admin/donantes', icon: Users, count: queries.donantes.data ?? 0, color: 'text-rose-600' },
    { label: 'Lotes', href: '/admin/lotes', icon: Warehouse, count: queries.lotes.data ?? 0, color: 'text-cyan-600' },
    { label: 'Viajes', href: '/admin/viajes', icon: Truck, count: queries.viajes.data ?? 0, color: 'text-orange-600' },
    { label: 'Solicitudes', href: '/admin/solicitudes', icon: FileText, count: queries.solicitudes.data ?? 0, color: 'text-indigo-600' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Panel de Control</h1>
        <p className="text-muted-foreground">Resumen general del sistema de donaciones</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <a key={item.label} href={item.href} className="block">
              <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
                  <Icon className={`size-4 ${item.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{item.count}</div>
                </CardContent>
              </Card>
            </a>
          )
        })}
      </div>
    </div>
  )
}
