import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateLoteDto } from './dto/create-lote.dto'
import { UpdateLoteDto } from './dto/update-lote.dto'
import { TransferirLotesDto } from './dto/transferir-lotes.dto'
import * as QRCode from 'qrcode'

@Injectable()
export class LotesService {
  constructor(private prisma: PrismaService) {}

  private readonly include = {
    donante: true,
    producto: { include: { categoria: true } },
    ubicacion: true,
    campania: true,
  }

  private generarCodigo(): string {
    const now = new Date()
    const yymmdd = `${now.getFullYear().toString().slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `LOTE-${yymmdd}-${rand}`
  }

  async listar(ubicacionId?: number) {
    return this.prisma.lote.findMany({
      where: ubicacionId ? { ubicacionId } : undefined,
      include: this.include,
      orderBy: { createdAt: 'desc' },
    })
  }

  async obtener(id: number) {
    const lote = await this.prisma.lote.findUnique({
      where: { id },
      include: this.include,
    })
    if (!lote) throw new NotFoundException('Lote no encontrado')
    return lote
  }

  async crear(dto: CreateLoteDto) {
    const codigo = this.generarCodigo()
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    const qrData = `${baseUrl}/lotes/${codigo}`
    const qrUrl = await QRCode.toDataURL(qrData)

    return this.prisma.$transaction(async (tx) => {
      const lote = await tx.lote.create({
        data: {
          codigo,
          cantidad: dto.cantidad,
          observaciones: dto.observaciones,
          qrUrl,
          campaniaId: dto.campaniaId,
          ubicacionId: dto.ubicacionId,
          productoId: dto.productoId,
          donanteId: dto.donanteId,
        },
        include: this.include,
      })

      await tx.movimientoInventario.create({
        data: {
          tipo: 'ENTRADA',
          cantidad: dto.cantidad,
          saldoAnterior: 0,
          saldoNuevo: dto.cantidad,
          observaciones: `Entrada automática del lote ${codigo}`,
          loteId: lote.id,
          ubicacionId: dto.ubicacionId,
          campaniaId: dto.campaniaId,
        },
      })

      await this.actualizarSolicitudConLote(tx, dto, codigo)

      return lote
    })
  }

  private async actualizarSolicitudConLote(
    tx: any,
    dto: CreateLoteDto,
    codigo: string,
  ) {
    const solicitudes = await tx.solicitud.findMany({
      where: {
        estado: { in: ['ABIERTA', 'EN_PROCESO'] },
        detalles: { some: { productoId: dto.productoId } },
      },
      include: {
        detalles: {
          where: { productoId: dto.productoId },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    let restante = dto.cantidad

    for (const solicitud of solicitudes) {
      if (restante <= 0) break

      for (const detalle of solicitud.detalles) {
        if (restante <= 0) break
        const pendiente = detalle.meta - detalle.recibido
        if (pendiente <= 0) continue

        const aAsignar = Math.min(pendiente, restante)
        restante -= aAsignar

        await tx.detalleSolicitud.update({
          where: { id: detalle.id },
          data: { recibido: detalle.recibido + aAsignar },
        })
      }

      const detallesActualizados = await tx.detalleSolicitud.findMany({
        where: { solicitudId: solicitud.id },
      })

      const todosCompletos = detallesActualizados.every(
        (d: { recibido: number; meta: number }) => d.recibido >= d.meta,
      )

      if (todosCompletos) {
        await tx.solicitud.update({
          where: { id: solicitud.id },
          data: { estado: 'COMPLETADA' },
        })
      }
    }
  }

  async actualizar(id: number, dto: UpdateLoteDto) {
    await this.obtener(id)
    return this.prisma.lote.update({
      where: { id },
      data: dto,
      include: this.include,
    })
  }

  async transferir(dto: TransferirLotesDto) {
    const lotes = await this.prisma.lote.findMany({
      where: { id: { in: dto.loteIds } },
    })

    if (lotes.length !== dto.loteIds.length) {
      throw new NotFoundException('Uno o más lotes no existen')
    }

    const noDisponibles = lotes.filter(l => l.estado !== 'DISPONIBLE')
    if (noDisponibles.length > 0) {
      throw new BadRequestException(
        `Solo se pueden transferir lotes DISPONIBLES. No disponibles: ${noDisponibles.map(l => l.codigo).join(', ')}`
      )
    }

    return this.prisma.$transaction(async (tx) => {
      for (const lote of lotes) {
        const ultimo = await tx.movimientoInventario.findFirst({
          where: { loteId: lote.id, ubicacionId: lote.ubicacionId },
          orderBy: { createdAt: 'desc' },
        })
        const saldoAnterior = ultimo?.saldoNuevo ?? 0

        await tx.movimientoInventario.create({
          data: {
            tipo: 'TRANSFERENCIA',
            cantidad: lote.cantidad,
            saldoAnterior,
            saldoNuevo: 0,
            observaciones: `Transferencia de ubicación #${lote.ubicacionId} → #${dto.ubicacionDestinoId}${dto.observaciones ? ': ' + dto.observaciones : ''}`,
            loteId: lote.id,
            ubicacionId: lote.ubicacionId,
            campaniaId: lote.campaniaId,
          },
        })

        await tx.lote.update({
          where: { id: lote.id },
          data: { ubicacionId: dto.ubicacionDestinoId },
        })

        const ultimoDestino = await tx.movimientoInventario.findFirst({
          where: { loteId: lote.id, ubicacionId: dto.ubicacionDestinoId },
          orderBy: { createdAt: 'desc' },
        })
        const saldoDestino = ultimoDestino?.saldoNuevo ?? 0

        await tx.movimientoInventario.create({
          data: {
            tipo: 'ENTRADA',
            cantidad: lote.cantidad,
            saldoAnterior: saldoDestino,
            saldoNuevo: saldoDestino + lote.cantidad,
            observaciones: `Recepción por transferencia desde ubicación #${lote.ubicacionId}${dto.observaciones ? ': ' + dto.observaciones : ''}`,
            loteId: lote.id,
            ubicacionId: dto.ubicacionDestinoId,
            campaniaId: lote.campaniaId,
          },
        })
      }

      return tx.lote.findMany({
        where: { id: { in: dto.loteIds } },
        include: this.include,
      })
    })
  }

  async eliminar(id: number) {
    await this.obtener(id)
    await this.prisma.lote.delete({ where: { id } })
  }
}
