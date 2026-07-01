import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateRecepcionDto } from './dto/create-recepcion.dto'
import { UpdateRecepcionDto } from './dto/update-recepcion.dto'

const TIPOS_ENTRADA = ['ENTRADA', 'RECEPCION']

@Injectable()
export class RecepcionesService {
  constructor(private prisma: PrismaService) {}

  private readonly include = {
    viaje: {
      include: {
        origen: true,
        destino: true,
      },
    },
    responsable: true,
    detalles: {
      include: {
        lote: {
          include: {
            producto: { include: { categoria: true } },
            donante: true,
            ubicacion: true,
          },
        },
      },
    },
  }

  async listar() {
    return this.prisma.recepcion.findMany({
      include: this.include,
      orderBy: { createdAt: 'desc' },
    })
  }

  async obtener(id: number) {
    const recepcion = await this.prisma.recepcion.findUnique({
      where: { id },
      include: this.include,
    })
    if (!recepcion) throw new NotFoundException('Recepción no encontrada')
    return recepcion
  }

  async crear(dto: CreateRecepcionDto) {
    const viaje = await this.prisma.viaje.findUnique({
      where: { id: dto.viajeId },
    })
    if (!viaje) throw new BadRequestException('Viaje no encontrado')

    const ubicacionId = viaje.destinoId
    const campaniaId = viaje.campaniaId

    return this.prisma.$transaction(async (tx) => {
      const recepcion = await tx.recepcion.create({
        data: {
          fecha: new Date(),
          observaciones: dto.observaciones,
          viajeId: dto.viajeId,
          responsableId: dto.responsableId,
          detalles: {
            createMany: {
              data: dto.detalles.map((d) => ({
                cantidadRecibida: d.cantidadRecibida,
                cantidadFaltante: d.cantidadFaltante ?? 0,
                cantidadDanada: d.cantidadDanada ?? 0,
                observaciones: d.observaciones,
                loteId: d.loteId,
              })),
            },
          },
        },
        include: this.include,
      })

      for (const detalle of dto.detalles) {
        const ultimo = await tx.movimientoInventario.findFirst({
          where: { loteId: detalle.loteId, ubicacionId },
          orderBy: { createdAt: 'desc' },
        })

        const saldoAnterior = ultimo?.saldoNuevo ?? 0
        const saldoNuevo = saldoAnterior + detalle.cantidadRecibida

        await tx.movimientoInventario.create({
          data: {
            tipo: 'RECEPCION' as any,
            cantidad: detalle.cantidadRecibida,
            saldoAnterior,
            saldoNuevo,
            observaciones: `Recepción de viaje #${viaje.id}: ${detalle.observaciones ?? ''}`.trim(),
            loteId: detalle.loteId,
            ubicacionId,
            campaniaId,
          },
        })
      }

      return recepcion
    })
  }

  async actualizar(id: number, dto: UpdateRecepcionDto) {
    await this.obtener(id)
    const data: any = {}
    if (dto.observaciones !== undefined) data.observaciones = dto.observaciones
    if (dto.responsableId !== undefined) data.responsableId = dto.responsableId
    if (dto.viajeId !== undefined) data.viajeId = dto.viajeId
    return this.prisma.recepcion.update({
      where: { id },
      data,
      include: this.include,
    })
  }

  async eliminar(id: number) {
    await this.obtener(id)
    await this.prisma.recepcion.delete({ where: { id } })
  }
}
