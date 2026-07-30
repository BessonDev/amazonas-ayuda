function escMD(text: string): string {
  return text.replace(/[_*\[\]()~`>#+\-=|{}.!\\]/g, '\\$&')
}

export function formatViajeCreado(v: any): string {
  const baseUrl = process.env.FRONTEND_URL || 'https://laredsolidaria.org'
  const link = `${baseUrl}/admin/viajes/${v.id}`
  const productos = (v.detalles ?? []).map(
    (d: any) =>
      `• ${escMD(d.lote?.producto?.nombre ?? 'Producto')}: ${d.cantidad} ${escMD(d.lote?.producto?.unidad?.toLowerCase() ?? 'u')}`
  ).join('\n')

  return [
    '🚚 *Nuevo Viaje*',
    `*Código:* ${escMD(v.codigo)}`,
    `*Origen:* ${escMD(v.origen?.nombre ?? '')}`,
    `*Destino:* ${escMD(v.destino?.nombre ?? '')}`,
    `*Vehículo:* ${escMD(v.vehiculo ?? 'No especificado')}`,
    `*Conductor:* ${escMD(v.conductor ?? 'No especificado')}`,
    v.campania ? `*Campaña:* ${escMD(v.campania.nombre ?? '')}` : '',
    productos ? `*Productos:*\n${productos}` : '',
    `[Ver en panel](${link})`,
  ].filter(Boolean).join('\n')
}

export function formatViajeActualizado(v: any, cambios?: string): string {
  const baseUrl = process.env.FRONTEND_URL || 'https://laredsolidaria.org'
  const link = `${baseUrl}/admin/viajes/${v.id}`

  let estadoEmoji = '📋'
  if (v.estado === 'EN_TRANSITO') estadoEmoji = '🚚'
  if (v.estado === 'COMPLETADO') estadoEmoji = '✅'
  if (v.estado === 'RECEPCION_PARCIAL') estadoEmoji = '⚠️'
  if (v.estado === 'CANCELADO') estadoEmoji = '❌'

  return [
    `${estadoEmoji} *Viaje Actualizado*`,
    `*Código:* ${escMD(v.codigo)}`,
    `*Estado:* ${v.estado}`,
    cambios ? `*Cambios:* ${escMD(cambios)}` : '',
    `*Origen:* ${escMD(v.origen?.nombre ?? '')}`,
    `*Destino:* ${escMD(v.destino?.nombre ?? '')}`,
    v.campania ? `*Campaña:* ${escMD(v.campania.nombre ?? '')}` : '',
    `[Ver en panel](${link})`,
  ].filter(Boolean).join('\n')
}

export function formatViajeRecibido(v: any): string {
  const baseUrl = process.env.FRONTEND_URL || 'https://laredsolidaria.org'
  const link = `${baseUrl}/admin/viajes/${v.id}`
  const recepcion = v.recepciones?.[v.recepciones.length - 1]

  return [
    '📦 *Viaje Recibido*',
    `*Código:* ${escMD(v.codigo)}`,
    `*Estado:* ${v.estado === 'COMPLETADO' ? '✅ Completado' : '⚠️ Recepción Parcial'}`,
    `*Destino:* ${escMD(v.destino?.nombre ?? '')}`,
    recepcion?.fecha ? `*Fecha:* ${new Date(recepcion.fecha).toLocaleDateString('es-VE')}` : '',
    v.campania ? `*Campaña:* ${escMD(v.campania.nombre ?? '')}` : '',
    `[Ver en panel](${link})`,
  ].filter(Boolean).join('\n')
}
