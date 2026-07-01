export interface Paginacion {
  pagina: number
  limite: number
  total: number
  totalPaginas: number
}

export interface RespuestaPaginada<T> {
  datos: T[]
  paginacion: Paginacion
}

export interface RespuestaApi<T> {
  exito: boolean
  datos?: T
  mensaje?: string
  error?: string
}

export interface EstadisticasPublicas {
  totalDonaciones: number
  productosEntregados: number
  viajesRealizados: number
  centrosActivos: number
  personasBeneficiadas?: number
}
