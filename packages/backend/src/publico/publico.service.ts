import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class PublicoService {
  constructor(private prisma: PrismaService) {}

  async stats() {
    const [lotes, viajes, ubicaciones, donantes] = await Promise.all([
      this.prisma.lote.count(),
      this.prisma.viaje.count({ where: { estado: 'COMPLETADO' } }),
      this.prisma.ubicacion.count(),
      this.prisma.donante.count(),
    ])

    const totalDonaciones = await this.prisma.lote.aggregate({
      _sum: { cantidad: true },
    })

    return {
      lotes,
      viajesCompletados: viajes,
      ubicaciones,
      donantes,
      unidadesDonadas: totalDonaciones._sum.cantidad ?? 0,
    }
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
          select: {
            id: true,
            tipo: true,
            cantidad: true,
            createdAt: true,
            ubicacionId: true,
            observaciones: true,
          },
        },
      },
    })

    if (!lote) throw new NotFoundException('Lote no encontrado')

    return lote
  }
}
