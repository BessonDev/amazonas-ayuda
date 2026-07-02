'use client'

import { useAuth } from '@/contexts/auth-context'

export function useRole() {
  const { usuario } = useAuth()
  const rol = usuario?.rol ?? ''

  return {
    rol,
    hasRole: (...roles: string[]) => roles.includes(rol),
    isAdmin: rol === 'ADMINISTRADOR',
    isCoord: rol === 'COORDINADOR_LOGISTICO',
    isOperator: rol === 'OPERADOR_INVENTARIO',
    isResponsable: rol === 'RESPONSABLE_DESTINO',
    canManage: ['ADMINISTRADOR', 'COORDINADOR_LOGISTICO'].includes(rol),
    canDelete: rol === 'ADMINISTRADOR',
    canTransfer: ['ADMINISTRADOR', 'COORDINADOR_LOGISTICO'].includes(rol),
    canChangeStatus: ['ADMINISTRADOR', 'COORDINADOR_LOGISTICO'].includes(rol),
  }
}
