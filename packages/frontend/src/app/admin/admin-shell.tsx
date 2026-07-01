'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  MapPin,
  Tags,
  ShoppingCart,
  Users,
  Truck,
  ClipboardList,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  Warehouse,
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const menuItems = [
  {
    label: 'General',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Catálogo',
    items: [
      { label: 'Campañas', href: '/admin/campanias', icon: ClipboardList },
      { label: 'Ubicaciones', href: '/admin/ubicaciones', icon: MapPin },
      { label: 'Categorías', href: '/admin/categorias', icon: Tags },
      { label: 'Productos', href: '/admin/productos', icon: Package },
      { label: 'Donantes', href: '/admin/donantes', icon: Users },
    ],
  },
  {
    label: 'Inventario',
    items: [
      { label: 'Lotes', href: '/admin/lotes', icon: Warehouse },
      { label: 'Movimientos', href: '/admin/movimientos', icon: ShoppingCart },
    ],
  },
  {
    label: 'Operaciones',
    items: [
      { label: 'Viajes', href: '/admin/viajes', icon: Truck },
      { label: 'Recepciones', href: '/admin/recepciones', icon: FileText },
      { label: 'Solicitudes', href: '/admin/solicitudes', icon: ClipboardList },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { label: 'Usuarios', href: '/admin/usuarios', icon: Users },
      { label: 'Archivos', href: '/admin/archivos', icon: FileText },
      { label: 'Configuración', href: '/admin/configuracion', icon: Settings },
    ],
  },
]

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { usuario, logout, cargando } = useAuth()
  const router = useRouter()
  const isLoginPage = pathname === '/admin/login'

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground animate-pulse">Cargando...</p>
      </div>
    )
  }

  // Login page → render sin sidebar (sin sesión o después de logout)
  if (isLoginPage) {
    return <>{children}</>
  }

  if (!usuario) {
    return null
  }

  const handleLogout = async () => {
    await logout()
    router.push('/admin/login')
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="sidebar">
        <SidebarHeader className="p-2">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 px-2 py-1"
          >
            <Image
              src="/logo.png"
              alt="Logo"
              width={32}
              height={32}
              className="size-8 rounded-lg"
              priority
            />
            <span className="truncate text-sm font-semibold group-data-[collapsible=icon]:hidden">
              Donaciones Amazonas
            </span>
          </Link>
        </SidebarHeader>

        <SidebarContent>
          {menuItems.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          render={<Link href={item.href} />}
                          isActive={isActive}
                          tooltip={item.label}
                        >
                          <Icon />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
              <SidebarSeparator />
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Cerrar sesión"
                onClick={handleLogout}
              >
                <LogOut />
                <span>Cerrar sesión</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <div className="group-data-[collapsible=icon]:hidden px-2 py-1 text-xs text-muted-foreground truncate">
            {usuario.nombre}
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-12 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <span className="text-sm text-muted-foreground">
            {usuario.rol}
          </span>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
