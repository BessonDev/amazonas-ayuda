import { PrismaClient, RolNombre } from '@prisma/client'
import * as bcrypt from 'bcrypt'

type DescripcionMap = Record<string, string>

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // Roles
  const descripcionMap: DescripcionMap = {
    ADMINISTRADOR: 'Acceso completo al sistema',
    COORDINADOR_LOGISTICO: 'Gestiona campañas, viajes y distribución',
    OPERADOR_INVENTARIO: 'Registra donaciones y movimientos',
    RESPONSABLE_DESTINO: 'Confirma recepciones y crea solicitudes',
  }

  const roles = await Promise.all(
    Object.values(RolNombre).map((nombre) =>
      prisma.rol.upsert({
        where: { nombre },
        update: {},
        create: {
          nombre,
          descripcion: descripcionMap[nombre] || null,
        },
      }),
    ),
  )
  console.log(`✓ ${roles.length} roles creados`)

  // Permisos base
  const permisosData = [
    { codigo: 'campanias:crear', nombre: 'Crear campañas' },
    { codigo: 'campanias:leer', nombre: 'Ver campañas' },
    { codigo: 'campanias:actualizar', nombre: 'Actualizar campañas' },
    { codigo: 'campanias:eliminar', nombre: 'Eliminar campañas' },
    { codigo: 'ubicaciones:gestionar', nombre: 'Gestionar ubicaciones' },
    { codigo: 'inventario:registrar', nombre: 'Registrar donaciones' },
    { codigo: 'inventario:consultar', nombre: 'Consultar inventario' },
    { codigo: 'viajes:crear', nombre: 'Crear viajes' },
    { codigo: 'viajes:gestionar', nombre: 'Gestionar viajes' },
    { codigo: 'recepciones:confirmar', nombre: 'Confirmar recepciones' },
    { codigo: 'solicitudes:crear', nombre: 'Crear solicitudes' },
    { codigo: 'solicitudes:gestionar', nombre: 'Gestionar solicitudes' },
    { codigo: 'reportes:generar', nombre: 'Generar reportes' },
    { codigo: 'usuarios:gestionar', nombre: 'Gestionar usuarios' },
    { codigo: 'auditoria:consultar', nombre: 'Consultar auditoría' },
  ]

  const permisos = await Promise.all(
    permisosData.map((p) =>
      prisma.permiso.upsert({
        where: { codigo: p.codigo },
        update: {},
        create: p,
      }),
    ),
  )
  console.log(`✓ ${permisos.length} permisos creados`)

  // Asignar todos los permisos al rol ADMINISTRADOR
  const adminRol = roles.find((r) => r.nombre === RolNombre.ADMINISTRADOR)!
  for (const permiso of permisos) {
    await prisma.rolPermiso.upsert({
      where: { rolId_permisoId: { rolId: adminRol.id, permisoId: permiso.id } },
      update: {},
      create: { rolId: adminRol.id, permisoId: permiso.id },
    })
  }
  console.log('✓ Permisos asignados a ADMINISTRADOR')

  // Usuario admin por defecto
  const passwordHash = await bcrypt.hash('admin123', 10)
  await prisma.usuario.upsert({
    where: { email: 'admin@donaciones.org' },
    update: {},
    create: {
      nombre: 'Administrador',
      email: 'admin@donaciones.org',
      passwordHash,
      rolId: adminRol.id,
    },
  })
  console.log('✓ Usuario admin creado (admin@donaciones.org / admin123)')

  // Tipos de ubicación
  const tiposUbicacion = [
    { nombre: 'CENTRO_ACOPIO', descripcion: 'Centro de acopio principal' },
    { nombre: 'HOSPITAL', descripcion: 'Hospital o centro de salud' },
    { nombre: 'REFUGIO', descripcion: 'Refugio temporal' },
    { nombre: 'IGLESIA', descripcion: 'Iglesia' },
    { nombre: 'COMUNIDAD', descripcion: 'Comunidad o punto de entrega final' },
    { nombre: 'OTRO', descripcion: 'Otro tipo de ubicación' },
  ]

  for (const t of tiposUbicacion) {
    await prisma.tipoUbicacion.upsert({
      where: { nombre: t.nombre },
      update: {},
      create: t,
    })
  }
  console.log(`✓ ${tiposUbicacion.length} tipos de ubicación creados`)

  // Categorías base
  const categorias = [
    { nombre: 'Alimentos', descripcion: 'Alimentos no perecederos', icono: '🍲' },
    { nombre: 'Agua', descripcion: 'Agua potable y bebidas', icono: '💧' },
    { nombre: 'Medicinas', descripcion: 'Medicamentos e insumos médicos', icono: '💊' },
    { nombre: 'Higiene', descripcion: 'Productos de higiene personal', icono: '🧴' },
    { nombre: 'Ropa', descripcion: 'Ropa y calzado', icono: '👕' },
    { nombre: 'Cobijas', descripcion: 'Cobijas, frazadas y colchonetas', icono: '🛏️' },
    { nombre: 'Herramientas', descripcion: 'Herramientas y equipos', icono: '🔧' },
    { nombre: 'Otros', descripcion: 'Otros artículos', icono: '📦' },
  ]

  for (const c of categorias) {
    await prisma.categoria.upsert({
      where: { nombre: c.nombre },
      update: {},
      create: c,
    })
  }
  console.log(`✓ ${categorias.length} categorías creadas`)

  // Configuración base
  const configs = [
    { clave: 'organizacion_nombre', valor: 'Donaciones Amazonas' },
    { clave: 'organizacion_descripcion', valor: 'Plataforma de gestión logística para donaciones humanitarias' },
    { clave: 'campania_activa_id', valor: '' },
  ]

  for (const c of configs) {
    await prisma.configuracion.upsert({
      where: { clave: c.clave },
      update: {},
      create: c,
    })
  }
  console.log('✓ Configuración base creada')

  console.log('\n✅ Seed completado exitosamente')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
