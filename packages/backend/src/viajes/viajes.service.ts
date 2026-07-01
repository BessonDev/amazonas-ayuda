import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateViajeDto } from './dto/create-viaje.dto'
import { UpdateViajeDto } from './dto/update-viaje.dto'

@Injectable()
export class ViajesService {
  constructor(private prisma: PrismaService) {}

  private readonly include = {
    campania: true,
    origen: true,
    destino: true,
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
    recepciones: true,
  }

  private generarCodigo(): string {
    const now = new Date()
    const yymmdd = `${now.getFullYear().toString().slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `VIAJE-${yymmdd}-${rand}`
  }

  async listar() {
    return this.prisma.viaje.findMany({
      include: this.include,
      orderBy: { createdAt: 'desc' },
    })
  }

  async obtener(id: number) {
    const viaje = await this.prisma.viaje.findUnique({
      where: { id },
      include: this.include,
    })
    if (!viaje) throw new NotFoundException('Viaje no encontrado')
    return viaje
  }

  async crear(dto: CreateViajeDto) {
    const codigo = this.generarCodigo()

    return this.prisma.viaje.create({
      data: {
        codigo,
        nombreResponsable: dto.nombreResponsable,
        vehiculo: dto.vehiculo,
        conductor: dto.conductor,
        fechaSalida: dto.fechaSalida ? new Date(dto.fechaSalida) : undefined,
        fechaEstimada: dto.fechaEstimada ? new Date(dto.fechaEstimada) : undefined,
        fechaLlegada: dto.fechaLlegada ? new Date(dto.fechaLlegada) : undefined,
        observaciones: dto.observaciones,
        estado: dto.estado,
        campaniaId: dto.campaniaId,
        origenId: dto.origenId,
        destinoId: dto.destinoId,
        responsableId: dto.responsableId,
        detalles: {
          createMany: {
            data: dto.detalles.map((d) => ({
              cantidad: d.cantidad,
              loteId: d.loteId,
            })),
          },
        },
      },
      include: this.include,
    })
  }

  async actualizar(id: number, dto: UpdateViajeDto) {
    const viaje = await this.obtener(id)

    const { detalles, ...rest } = dto

    const data: any = {}
    for (const [key, value] of Object.entries(rest)) {
      if (value === undefined) continue
      if (key.startsWith('fecha')) {
        data[key] = new Date(value)
      } else {
        data[key] = value
      }
    }

    const transito = rest.estado === 'EN_TRANSITO' && viaje.estado !== 'EN_TRANSITO'

    if (transito) {
      return this.prisma.$transaction(async (tx) => {
        if (detalles !== undefined) {
          await tx.detalleViaje.deleteMany({ where: { viajeId: id } })
          await tx.detalleViaje.createMany({
            data: detalles.map((d) => ({
              viajeId: id,
              cantidad: d.cantidad,
              loteId: d.loteId,
            })),
          })
        }

        const updated = await tx.viaje.update({
          where: { id },
          data,
          include: this.include,
        })

        const detallesList = detalles ?? viaje.detalles

        for (const det of detallesList) {
          const ultimo = await tx.movimientoInventario.findFirst({
            where: { loteId: det.loteId, ubicacionId: viaje.origenId },
            orderBy: { createdAt: 'desc' },
          })

          const saldoAnterior = ultimo?.saldoNuevo ?? 0
          const saldoNuevo = Math.max(0, saldoAnterior - det.cantidad)

          await tx.movimientoInventario.create({
            data: {
              tipo: 'ENVIO',
              cantidad: det.cantidad,
              saldoAnterior,
              saldoNuevo,
              observaciones: `Envío en viaje ${viaje.codigo}`,
              loteId: det.loteId,
              ubicacionId: viaje.origenId,
              campaniaId: viaje.campaniaId,
              viajeId: id,
            },
          })

          await tx.lote.update({
            where: { id: det.loteId },
            data: { estado: 'EN_TRANSITO' },
          })
        }

        return updated
      })
    }

    if (detalles !== undefined) {
      await this.prisma.detalleViaje.deleteMany({ where: { viajeId: id } })
      await this.prisma.detalleViaje.createMany({
        data: detalles.map((d) => ({
          viajeId: id,
          cantidad: d.cantidad,
          loteId: d.loteId,
        })),
      })
    }

    return this.prisma.viaje.update({
      where: { id },
      data,
      include: this.include,
    })
  }

  async eliminar(id: number) {
    await this.obtener(id)
    await this.prisma.viaje.delete({ where: { id } })
  }
}
