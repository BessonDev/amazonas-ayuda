import { PrismaClient, EstadoCampania, EstadoLote, TipoMovimiento, EstadoViaje, PrioridadSolicitud, EstadoSolicitud, TipoDonante, UnidadMedida } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Sembrando datos demo...')

  // Clean existing demo data
  await prisma.detalleRecepcion.deleteMany()
  await prisma.recepcion.deleteMany()
  await prisma.detalleViaje.deleteMany()
  await prisma.movimientoInventario.deleteMany()
  await prisma.detalleSolicitud.deleteMany()
  await prisma.solicitud.deleteMany()
  await prisma.lote.deleteMany()
  await prisma.viaje.deleteMany()
  await prisma.donante.deleteMany()
  await prisma.producto.deleteMany()
  await prisma.ubicacion.deleteMany()
  await prisma.campania.deleteMany()
  console.log('✓ Datos anteriores eliminados')

  // Campaña
  const campania = await prisma.campania.create({
    data: {
      nombre: 'Campaña de Prueba',
      descripcion: 'Campaña demo para mostrar el funcionamiento de la plataforma',
      estado: EstadoCampania.ACTIVA,
    },
  })
  console.log(`✓ Campaña: ${campania.nombre}`)

  // Categorías existentes (del seed principal)
  const catAlimentos = await prisma.categoria.findUnique({ where: { nombre: 'Alimentos' } })
  const catAgua = await prisma.categoria.findUnique({ where: { nombre: 'Agua' } })
  const catMedicinas = await prisma.categoria.findUnique({ where: { nombre: 'Medicinas' } })
  const catHigiene = await prisma.categoria.findUnique({ where: { nombre: 'Higiene' } })
  const catCobijas = await prisma.categoria.findUnique({ where: { nombre: 'Cobijas' } })

  if (!catAlimentos || !catAgua || !catMedicinas || !catHigiene || !catCobijas) {
    throw new Error('Ejecuta primero el seed principal (npx prisma db seed)')
  }

  // TipoUbicacion existentes
  const tipoCentroAcopio = await prisma.tipoUbicacion.findUnique({ where: { nombre: 'CENTRO_ACOPIO' } })
  const tipoHospital = await prisma.tipoUbicacion.findUnique({ where: { nombre: 'HOSPITAL' } })
  const tipoRefugio = await prisma.tipoUbicacion.findUnique({ where: { nombre: 'REFUGIO' } })
  const tipoIglesia = await prisma.tipoUbicacion.findUnique({ where: { nombre: 'IGLESIA' } })

  if (!tipoCentroAcopio || !tipoHospital || !tipoRefugio || !tipoIglesia) {
    throw new Error('Ejecuta primero el seed principal (npx prisma db seed)')
  }

  // Ubicaciones
  const ubicacionesData = [
    { nombre: 'Centro de Acopio Puerto Ayacucho', direccion: 'Av. Principal, Puerto Ayacucho', ciudad: 'Puerto Ayacucho', tipoId: tipoCentroAcopio.id, campaniaId: campania.id },
    { nombre: 'Hospital de Maroa', direccion: 'Calle 5, Maroa', ciudad: 'Maroa', tipoId: tipoHospital.id, campaniaId: campania.id },
    { nombre: 'Refugio Comunitario La Esmeralda', direccion: 'Sector El Centro, La Esmeralda', ciudad: 'La Esmeralda', tipoId: tipoRefugio.id, campaniaId: campania.id },
    { nombre: 'Iglesia San José de Atabapo', direccion: 'Plaza Bolívar, San Fernando de Atabapo', ciudad: 'San Fernando de Atabapo', tipoId: tipoIglesia.id, campaniaId: campania.id },
  ]

  const ubicaciones: Record<string, any> = {}
  for (const u of ubicacionesData) {
    const created = await prisma.ubicacion.create({ data: u })
    ubicaciones[created.nombre] = created
  }
  console.log(`✓ ${ubicacionesData.length} ubicaciones creadas`)

  // Productos (usando findFirst porque no hay unique en nombre)
  const productosData = [
    { nombre: 'Arroz', descripcion: 'Arroz', unidad: UnidadMedida.KILO, categoriaId: catAlimentos.id },
    { nombre: 'Harina de Maíz', descripcion: 'Harina de maíz para arepas y pan', unidad: UnidadMedida.KILO, categoriaId: catAlimentos.id },
    { nombre: 'Agua Embotellada', descripcion: 'Agua para consumo familiar', unidad: UnidadMedida.LITRO, categoriaId: catAgua.id },
    { nombre: 'Leche en Polvo', descripcion: 'Leche en polvo para niños', unidad: UnidadMedida.KILO, categoriaId: catAlimentos.id },
    { nombre: 'Pastillas Potabilizadoras', descripcion: 'Pastillas potabilizadoras', unidad: UnidadMedida.PAQUETE, categoriaId: catAgua.id },
    { nombre: 'Cobijas Térmicas', descripcion: 'Cobijas térmicas para la noche', unidad: UnidadMedida.UNIDAD, categoriaId: catCobijas.id },
    { nombre: 'Jabón de Baño', descripcion: 'Jabón para higiene personal', unidad: UnidadMedida.UNIDAD, categoriaId: catHigiene.id },
    { nombre: 'Antibióticos (Amoxicilina)', descripcion: 'Amoxicilina para infecciones comunes', unidad: UnidadMedida.CAJA, categoriaId: catMedicinas.id },
  ]

  const productos: Record<string, any> = {}
  for (const p of productosData) {
    let prod = await prisma.producto.findFirst({ where: { nombre: p.nombre } })
    if (!prod) {
      prod = await prisma.producto.create({ data: p })
    }
    productos[p.nombre] = prod
  }
  console.log(`✓ ${productosData.length} productos creados/encontrados`)

  // Donantes
  const donantesData = [
    { tipo: TipoDonante.PERSONA, nombre: 'Pedro Pérez', documento: 'V-12345678' },
    { tipo: TipoDonante.EMPRESA, nombre: 'Distribuidora Los Llanos', documento: 'J-98765432' },
    { tipo: TipoDonante.IGLESIA, nombre: 'Iglesia San Juan', documento: 'J-11223344' },
  ]

  const donantes: Record<string, any> = {}
  for (const d of donantesData) {
    const created = await prisma.donante.create({ data: d })
    donantes[created.nombre!] = created
  }
  console.log(`✓ ${donantesData.length} donantes creados`)

  // Solicitudes
  const solicitudesData = [
    {
      titulo: 'Hospital de Maroa necesita insumos básicos',
      descripcion: 'El Hospital de Maroa atiende a más de 300 familias del municipio. Necesitamos reabastecer la farmacia y la cocina.',
      prioridad: PrioridadSolicitud.ALTA,
      campaniaId: campania.id,
      ubicacionId: ubicaciones['Hospital de Maroa'].id,
      detalles: [
        { productoId: productos['Arroz'].id, meta: 200, recibido: 45, descripcion: 'Arroz para alimentación de pacientes' },
        { productoId: productos['Leche en Polvo'].id, meta: 100, recibido: 30, descripcion: 'Leche para maternidad y pediatría' },
        { productoId: productos['Antibióticos (Amoxicilina)'].id, meta: 50, recibido: 12, descripcion: 'Amoxicilina para infecciones comunes' },
        { productoId: productos['Jabón de Baño'].id, meta: 300, recibido: 80, descripcion: 'Jabón para higiene hospitalaria' },
      ],
    },
    {
      titulo: 'La Esmeralda: emergencia por crecida del río',
      descripcion: 'Las lluvias recientes han afectado a 150 familias. Necesitamos agua potable, alimentos y cobijas urgentemente.',
      prioridad: PrioridadSolicitud.URGENTE,
      campaniaId: campania.id,
      ubicacionId: ubicaciones['Refugio Comunitario La Esmeralda'].id,
      detalles: [
        { productoId: productos['Agua Embotellada'].id, meta: 500, recibido: 200, descripcion: 'Agua para consumo familiar' },
        { productoId: productos['Arroz'].id, meta: 300, recibido: 100, descripcion: 'Arroz para las familias afectadas' },
        { productoId: productos['Pastillas Potabilizadoras'].id, meta: 100, recibido: 25, descripcion: 'Pastillas potabilizadoras' },
        { productoId: productos['Cobijas Térmicas'].id, meta: 200, recibido: 60, descripcion: 'Cobijas térmicas para la noche' },
      ],
    },
    {
      titulo: 'Atabapo: refuerzo de alimentos no perecederos',
      descripcion: 'La comunidad de San Fernando de Atabapo solicita apoyo con la despensa comunitaria.',
      prioridad: PrioridadSolicitud.MEDIA,
      campaniaId: campania.id,
      ubicacionId: ubicaciones['Iglesia San José de Atabapo'].id,
      detalles: [
        { productoId: productos['Harina de Maíz'].id, meta: 400, recibido: 150, descripcion: 'Harina de maíz para arepas y pan' },
        { productoId: productos['Arroz'].id, meta: 250, recibido: 90, descripcion: 'Arroz para la despensa' },
        { productoId: productos['Leche en Polvo'].id, meta: 150, recibido: 40, descripcion: 'Leche en polvo para niños' },
      ],
    },
  ]

  for (const s of solicitudesData) {
    const { detalles, ...solicitudData } = s
    const solicitud = await prisma.solicitud.create({
      data: {
        ...solicitudData,
        estado: EstadoSolicitud.ABIERTA,
        detalles: { create: detalles },
      },
    })
    console.log(`  ✓ Solicitud: ${solicitud.titulo} (${solicitud.id})`)
  }
  console.log(`✓ ${solicitudesData.length} solicitudes creadas`)

  // Viajes
  // Ubicar un responsable (admin)
  const admin = await prisma.usuario.findFirst({ where: { email: 'admin@donaciones.org' } })

  const viajesData = [
    {
      codigo: 'VIAJE-001',
      vehiculo: 'Camión 3500',
      conductor: 'Carlos Pérez',
      fechaSalida: new Date('2026-07-01'),
      fechaEstimada: new Date('2026-07-03'),
      estado: EstadoViaje.EN_TRANSITO,
      campaniaId: campania.id,
      origenId: ubicaciones['Centro de Acopio Puerto Ayacucho'].id,
      destinoId: ubicaciones['Hospital de Maroa'].id,
      responsableId: admin?.id || null,
    },
    {
      codigo: 'VIAJE-002',
      vehiculo: 'Camión 750',
      conductor: 'José Martínez',
      fechaSalida: new Date('2026-07-05'),
      fechaEstimada: new Date('2026-07-07'),
      estado: EstadoViaje.EN_TRANSITO,
      campaniaId: campania.id,
      origenId: ubicaciones['Centro de Acopio Puerto Ayacucho'].id,
      destinoId: ubicaciones['Refugio Comunitario La Esmeralda'].id,
      responsableId: admin?.id || null,
    },
    {
      codigo: 'VIAJE-003',
      vehiculo: 'Camión 350',
      conductor: 'Ana Torres',
      fechaSalida: new Date('2026-07-10'),
      fechaEstimada: new Date('2026-07-11'),
      estado: EstadoViaje.PLANIFICADO,
      campaniaId: campania.id,
      origenId: ubicaciones['Centro de Acopio Puerto Ayacucho'].id,
      destinoId: ubicaciones['Iglesia San José de Atabapo'].id,
      responsableId: admin?.id || null,
    },
  ]

  for (const v of viajesData) {
    const viaje = await prisma.viaje.create({ data: v })
    console.log(`  ✓ Viaje: ${viaje.codigo} (${viaje.estado})`)
  }
  console.log(`✓ ${viajesData.length} viajes creados`)

  // Lotes demo (para que las solicitudes tengan recibido > 0)
  const loteData = [
    {
      codigo: 'DEMO-LOTE-001',
      cantidad: 45,
      productoId: productos['Arroz'].id,
      ubicacionId: ubicaciones['Hospital de Maroa'].id,
      donanteId: donantes['Pedro Pérez'].id,
      campaniaId: campania.id,
      responsableId: admin?.id || null,
    },
    {
      codigo: 'DEMO-LOTE-002',
      cantidad: 200,
      productoId: productos['Agua Embotellada'].id,
      ubicacionId: ubicaciones['Refugio Comunitario La Esmeralda'].id,
      donanteId: donantes['Distribuidora Los Llanos'].id,
      campaniaId: campania.id,
      responsableId: admin?.id || null,
    },
    {
      codigo: 'DEMO-LOTE-003',
      cantidad: 150,
      productoId: productos['Harina de Maíz'].id,
      ubicacionId: ubicaciones['Iglesia San José de Atabapo'].id,
      donanteId: donantes['Iglesia San Juan'].id,
      campaniaId: campania.id,
      responsableId: admin?.id || null,
    },
  ]

  for (const l of loteData) {
    const lote = await prisma.lote.create({
      data: {
        ...l,
        estado: EstadoLote.DISPONIBLE,
        movimientos: {
          create: {
            tipo: TipoMovimiento.ENTRADA,
            cantidad: l.cantidad,
            ubicacionId: l.ubicacionId,
            responsableId: admin?.id || null,
            campaniaId: campania.id,
          },
        },
      },
    })
    console.log(`  ✓ Lote: ${lote.codigo} (${lote.cantidad} unidades)`)
  }
  console.log(`✓ ${loteData.length} lotes demo creados`)

  console.log('\n✅ Demo completada exitosamente')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
