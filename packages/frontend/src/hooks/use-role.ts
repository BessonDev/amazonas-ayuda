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
    canDelete: ['ADMINISTRADOR', 'OPERADOR_INVENTARIO'].includes(rol),
    canDeleteViajes: ['ADMINISTRADOR', 'COORDINADOR_LOGISTICO'].includes(rol),
    canDeleteSolicitudes: ['ADMINISTRADOR', 'COORDINADOR_LOGISTICO'].includes(rol),
    canDeleteUbicaciones: ['ADMINISTRADOR', 'COORDINADOR_LOGISTICO'].includes(rol),
    canDeleteCategorias: ['ADMINISTRADOR', 'COORDINADOR_LOGISTICO'].includes(rol),
    canTransfer: ['ADMINISTRADOR', 'COORDINADOR_LOGISTICO'].includes(rol),
    canChangeStatus: ['ADMINISTRADOR', 'COORDINADOR_LOGISTICO'].includes(rol),
    canManageDonantes: ['ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'OPERADOR_INVENTARIO'].includes(rol),
    canDeleteDonantes: ['ADMINISTRADOR'].includes(rol),
    canCreateSolicitudes: ['ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'RESPONSABLE_DESTINO'].includes(rol),
    canAprobarSolicitudes: ['ADMINISTRADOR', 'COORDINADOR_LOGISTICO'].includes(rol),
    canCreateLotes: ['ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'OPERADOR_INVENTARIO'].includes(rol),
    canCreateProductos: ['ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'OPERADOR_INVENTARIO'].includes(rol),
}
}
