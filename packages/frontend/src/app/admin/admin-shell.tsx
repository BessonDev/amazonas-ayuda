'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import {
  LayoutDashboard,
  Package,
  MapPin,
  Tags,
  ShoppingCart,
  Users,
  Truck,
  ClipboardList,
  Image as ImageIcon,
  LogOut,
  ChevronLeft,
  Warehouse,
  FileText,
  BarChart3,
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
import { formatRol } from '@/lib/enums'

type Rol = 'ADMINISTRADOR' | 'COORDINADOR_LOGISTICO' | 'OPERADOR_INVENTARIO' | 'RESPONSABLE_DESTINO'

interface MenuItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: Rol[]
}

interface MenuGroup {
  label: string
  items: MenuItem[]
}

const menuItems: MenuGroup[] = [
  {
    label: 'General',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, roles: ['ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'OPERADOR_INVENTARIO', 'RESPONSABLE_DESTINO'] },
    ],
  },
  {
    label: 'Catálogo',
    items: [
      { label: 'Campañas', href: '/admin/campanias', icon: ClipboardList, roles: ['ADMINISTRADOR', 'COORDINADOR_LOGISTICO'] },
      { label: 'Ubicaciones', href: '/admin/ubicaciones', icon: MapPin, roles: ['ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'OPERADOR_INVENTARIO'] },
      { label: 'Categorías', href: '/admin/categorias', icon: Tags, roles: ['ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'OPERADOR_INVENTARIO'] },
      { label: 'Productos', href: '/admin/productos', icon: Package, roles: ['ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'OPERADOR_INVENTARIO', 'RESPONSABLE_DESTINO'] },
      { label: 'Donantes', href: '/admin/donantes', icon: Users, roles: ['ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'OPERADOR_INVENTARIO'] },
    ],
  },
{
      label: 'Inventario',
      items: [
        { label: 'Resumen', href: '/admin/inventario', icon: BarChart3, roles: ['ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'OPERADOR_INVENTARIO'] },
        { label: 'Lotes', href: '/admin/lotes', icon: Warehouse, roles: ['ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'OPERADOR_INVENTARIO'] },
        { label: 'Movimientos', href: '/admin/movimientos', icon: ShoppingCart, roles: ['ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'OPERADOR_INVENTARIO'] },
      ],
    },
  {
    label: 'Operaciones',
    items: [
      { label: 'Viajes', href: '/admin/viajes', icon: Truck, roles: ['ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'OPERADOR_INVENTARIO', 'RESPONSABLE_DESTINO'] },
      { label: 'Solicitudes', href: '/admin/solicitudes', icon: ClipboardList, roles: ['ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'OPERADOR_INVENTARIO', 'RESPONSABLE_DESTINO'] },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { label: 'Usuarios', href: '/admin/usuarios', icon: Users, roles: ['ADMINISTRADOR'] },
      { label: 'Imágenes', href: '/admin/archivos', icon: ImageIcon, roles: ['ADMINISTRADOR', 'COORDINADOR_LOGISTICO'] },
      { label: 'Reportes', href: '/admin/reportes', icon: FileText, roles: ['ADMINISTRADOR', 'COORDINADOR_LOGISTICO'] },
    ],
  },
]

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { usuario, logout, cargando } = useAuth()
  const router = useRouter()
  const isLoginPage = pathname === '/admin/login'

  const needsRedirect = (() => {
    if (!usuario || isLoginPage) return false
    const role = usuario.rol as Rol
    return !menuItems.some((g) =>
      g.items.some(
        (i) =>
          i.roles.includes(role) &&
          (pathname === i.href || pathname.startsWith(i.href + '/')),
      ),
    )
  })()

  useEffect(() => {
    if (needsRedirect) {
      router.push('/admin/dashboard')
    }
  }, [needsRedirect, router])

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

  const userRole = usuario.rol as Rol

  const allowedItems = menuItems
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.roles.includes(userRole)),
    }))
    .filter((group) => group.items.length > 0)

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
              src="/logob.png"
              alt="Logo"
              width={35}
              height={35}
              className="size-8"
              priority
            />
            <span className="truncate text-sm font-semibold group-data-[collapsible=icon]:hidden">
              La Red Solidaria
            </span>
          </Link>
        </SidebarHeader>

        <SidebarContent>
          {allowedItems.map((group) => (
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
            {formatRol(usuario.rol)}
            {usuario.ciudad && (
              <span className="ml-2 text-xs text-muted-foreground/70">
                · {usuario.ciudad}, {usuario.estado}
              </span>
            )}
          </span>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
