'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { api } from '@/lib/api'
import type { UsuarioSesion, LoginRequest, LoginResponse } from '@/lib/auth-types'

interface AuthContextType {
  usuario: UsuarioSesion | null
  cargando: boolean
  login: (credenciales: LoginRequest) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null)
  const [cargando, setCargando] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const res = await api.post<LoginResponse>('/auth/refresh')
      setUsuario({
        id: res.id,
        nombre: res.nombre,
        email: res.email,
        rol: res.rol,
        ubicacionId: res.ubicacionId,
      })
    } catch {
      setUsuario(null)
    }
  }, [])

  useEffect(() => {
    refresh().finally(() => setCargando(false))
  }, [refresh])

  const login = async (credenciales: LoginRequest) => {
    const res = await api.post<LoginResponse>('/auth/login', credenciales)
    setUsuario({
      id: res.id,
      nombre: res.nombre,
      email: res.email,
      rol: res.rol,
      ubicacionId: res.ubicacionId,
    })
  }

  const logout = async () => {
    await api.post('/auth/logout')
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}
