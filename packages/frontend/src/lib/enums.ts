export const ESTADO_VIAJE_LABELS: Record<string, string> = {
  PLANIFICADO: 'Planificado',
  EN_TRANSITO: 'En Tránsito',
  RECEPCION_PARCIAL: 'Recepción Parcial',
  COMPLETADO: 'Completado',
  CANCELADO: 'Cancelado',
}

export const ESTADO_LOTE_LABELS: Record<string, string> = {
  DISPONIBLE: 'Disponible',
  EN_TRANSITO: 'En Tránsito',
  ENTREGADO: 'Entregado',
}

export const TIPO_UBICACION_LABELS: Record<string, string> = {
  CENTRO_ACOPIO: 'Centro de Acopio',
  HOSPITAL: 'Hospital',
  REFUGIO: 'Refugio',
  IGLESIA: 'Iglesia',
  COMUNIDAD: 'Comunidad',
  OTRO: 'Otro',
}

export const TIPO_DONANTE_LABELS: Record<string, string> = {
  PERSONA: 'Persona',
  EMPRESA: 'Empresa',
  IGLESIA: 'Iglesia',
  FUNDACION: 'Fundación',
  ANONIMO: 'Anónimo',
}

export const ROL_LABELS: Record<string, string> = {
  ADMINISTRADOR: 'Administrador',
  COORDINADOR_LOGISTICO: 'Coordinador Logístico',
  OPERADOR_INVENTARIO: 'Operador de Inventario',
  RESPONSABLE_DESTINO: 'Responsable de Destino',
}

export const ESTADO_CAMPANIA_LABELS: Record<string, string> = {
  PLANIFICADA: 'Planificada',
  ACTIVA: 'Activa',
  PAUSADA: 'Pausada',
  FINALIZADA: 'Finalizada',
  CANCELADA: 'Cancelada',
}

export const PRIORIDAD_SOLICITUD_LABELS: Record<string, string> = {
  BAJA: 'Baja',
  MEDIA: 'Media',
  ALTA: 'Alta',
  URGENTE: 'Urgente',
}

export const UNIDAD_MEDIDA_ABREV: Record<string, string> = {
  UNIDAD: 'und',
  KILO: 'kg',
  LITRO: 'L',
  CAJA: 'caja',
  BOLSA: 'bolsa',
  PAQUETE: 'pte',
  GALON: 'gal',
  TONELADA: 't',
  PAR: 'par',
  OTRO: '',
}

export function formatLabel(value: string, labels: Record<string, string>): string {
  return labels[value] ?? value
}

export function formatEstadoViaje(value: string): string {
  return formatLabel(value, ESTADO_VIAJE_LABELS)
}

export function formatEstadoLote(value: string): string {
  return formatLabel(value, ESTADO_LOTE_LABELS)
}

export function formatTipoUbicacion(value: string): string {
  return formatLabel(value, TIPO_UBICACION_LABELS)
}

export function formatTipoDonante(value: string): string {
  return formatLabel(value, TIPO_DONANTE_LABELS)
}

export function formatRol(value: string): string {
  return formatLabel(value, ROL_LABELS)
}
