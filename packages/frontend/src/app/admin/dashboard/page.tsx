'use client'

import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { usuario, logout, cargando } = useAuth()
  const router = useRouter()

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  const handleLogout = async () => {
    await logout()
    router.push('/admin/login')
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Panel Administrativo</h1>
          <p className="text-muted-foreground">
            Bienvenido, {usuario?.nombre} — Rol: {usuario?.rol}
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}
