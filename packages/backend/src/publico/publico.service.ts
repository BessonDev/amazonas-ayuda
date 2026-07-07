import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class PublicoService {
  constructor(private prisma: PrismaService) {}

  async stats() {
    const [lotes, viajes, ubicaciones, donantes, solicitudesActivas] = await Promise.all([
      this.prisma.lote.count({ where: { deletedAt: null } }),
      this.prisma.viaje.count({ where: { estado: 'COMPLETADO' } }),
      this.prisma.ubicacion.count(),
      this.prisma.donante.count(),
      this.prisma.solicitud.count({
        where: { estado: { in: ['ABIERTA', 'EN_PROCESO'] } },
      }),
    ])

    return {
      lotes,
      viajesCompletados: viajes,
      ubicaciones,
      donantes,
      solicitudesActivas,
    }
  }

  async solicitudes() {
    const items = await this.prisma.solicitud.findMany({
      where: { estado: { in: ['ABIERTA', 'EN_PROCESO', 'COMPLETADA'] } },
      include: {
        campania: { select: { nombre: true } },
        ubicacion: { select: { id: true, nombre: true } },
        detalles: {
          include: {
            producto: { select: { id: true, nombre: true, unidad: true, categoria: { select: { icono: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return items.map((s) => ({
      id: s.id,
      titulo: s.titulo,
      descripcion: s.descripcion,
      prioridad: s.prioridad,
      estado: s.estado,
      campania: s.campania.nombre,
      ubicacion: s.ubicacion.nombre,
      createdAt: s.createdAt,
      productos: s.detalles.map((d) => ({
        id: d.id,
        producto: d.producto.nombre,
        productoId: d.producto.id,
        unidad: d.producto.unidad,
        icono: d.producto.categoria?.icono ?? null,
        meta: d.meta,
        recibido: d.recibido,
        pct: d.meta > 0 ? Math.round((d.recibido / d.meta) * 100) : 0,
        descripcion: d.descripcion,
      })),
    }))
  }

  async viajes() {
    const items = await this.prisma.viaje.findMany({
      where: { estado: { in: ['PLANIFICADO', 'EN_TRANSITO'] } },
      include: {
        origen: { select: { nombre: true } },
        destino: { select: { nombre: true } },
        campania: { select: { nombre: true } },
      },
      orderBy: { fechaSalida: 'asc' },
    })

    return items.map((v) => ({
      id: v.id,
      codigo: v.codigo,
      origen: v.origen.nombre,
      destino: v.destino.nombre,
      estado: v.estado,
      vehiculo: v.vehiculo,
      conductor: v.conductor,
      fechaSalida: v.fechaSalida,
      fechaEstimada: v.fechaEstimada,
      campania: v.campania.nombre,
    }))
  }

  async buscarLote(codigo: string) {
    const lote = await this.prisma.lote.findUnique({
      where: { codigo },
      include: {
        producto: { select: { nombre: true, unidad: true } },
        donante: { select: { nombre: true, tipo: true } },
        ubicacion: { select: { nombre: true } },
        campania: { select: { nombre: true } },
        movimientos: {
          orderBy: { createdAt: 'asc' },
          include: {
            ubicacion: { select: { nombre: true } },
          },
        },
      },
    })

    if (!lote) throw new NotFoundException('Lote no encontrado')

    return lote
  }

  async fotosRecepciones(limit = 15) {
    const archivos = await this.prisma.archivo.findMany({
      where: { entidadTipo: 'Recepcion' },
      include: {
        viaje: { select: { codigo: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return archivos.map((a) => ({
      id: a.id,
      nombre: a.nombre,
      url: `/api/archivos/${a.id}/descargar`,
      mimeType: a.mimeType,
      createdAt: a.createdAt,
      viajeCodigo: a.viaje?.codigo ?? null,
      recepcionId: a.entidadId,
    }))
  }
}
