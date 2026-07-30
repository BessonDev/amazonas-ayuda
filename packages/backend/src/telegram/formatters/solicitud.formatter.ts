function escMD(text: string): string {
  return text.replace(/[_*\[\]()~`>#+\-=|{}.!\\]/g, '\\$&')
}

function escapeJson(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

export function formatSolicitudCreada(s: any): string {
  const baseUrl = process.env.FRONTEND_URL || 'https://laredsolidaria.org'
  const link = `${baseUrl}/admin/solicitudes/${s.id}`
  const productos = (s.detalles ?? []).map(
    (d: any) =>
      `• ${escMD(d.producto?.nombre ?? 'Producto')}: ${d.meta} ${escMD(d.producto?.unidad?.toLowerCase() ?? 'u')}`
  ).join('\n')

  return [
    '🆕 *Nueva Solicitud*',
    `*Título:* ${escMD(s.titulo)}`,
    `*Prioridad:* ${s.prioridad === 'URGENTE' ? '🔴' : s.prioridad === 'ALTA' ? '🟠' : '🔵'} ${s.prioridad}`,
    s.ubicacion ? `*Ubicación:* ${escMD(s.ubicacion.nombre ?? '')}` : '',
    s.campania ? `*Campaña:* ${escMD(s.campania.nombre ?? '')}` : '',
    productos ? `*Productos:*\n${productos}` : '',
    `[Ver en panel](${link})`,
  ].filter(Boolean).join('\n')
}

export function formatSolicitudCompletada(s: any): string {
  const baseUrl = process.env.FRONTEND_URL || 'https://laredsolidaria.org'
  const link = `${baseUrl}/admin/solicitudes/${s.id}`
  const productos = (s.detalles ?? []).map(
    (d: any) =>
      `• ${escMD(d.producto?.nombre ?? 'Producto')}: ${d.recibido}/${d.meta} ${escMD(d.producto?.unidad?.toLowerCase() ?? 'u')} ✅`
  ).join('\n')

  return [
    '✅ *Solicitud Completada*',
    `*Título:* ${escMD(s.titulo)}`,
    productos ? `*Productos recibidos:*\n${productos}` : '',
    `[Ver en panel](${link})`,
  ].filter(Boolean).join('\n')
}
