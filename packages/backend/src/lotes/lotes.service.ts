import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common'
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

async listar(ciudadFilter: { ciudad: string; estado: string; pais: string } | null = null, ubicacionId?: number) {
  const where: any = {
    deletedAt: null,
    ...(ubicacionId ? { ubicacionId } : {}),
  }

  if (ciudadFilter) {
    where.ubicacion = {
      ciudad: ciudadFilter.ciudad,
      estado: ciudadFilter.estado,
      pais: ciudadFilter.pais,
    }
  }

  return this.prisma.lote.findMany({
    where,
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

async crear(dto: CreateLoteDto, user?: { id: number; rol: string }, ciudadFilter: { ciudad: string; estado: string; pais: string } | null = null) {
  const codigo = this.generarCodigo()
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
  const qrData = `${baseUrl}/lotes/${codigo}`
  const qrUrl = await QRCode.toDataURL(qrData)

  // If user is an operator, enforce that the lote belongs to their city
  if (ciudadFilter && user?.rol === 'OPERADOR_INVENTARIO') {
    if (!dto.ubicacionId) {
      throw new ForbiddenException('Debe especificar una ubicación para el lote')
    }
    const ubicacion = await this.prisma.ubicacion.findUnique({
      where: { id: dto.ubicacionId },
      select: { ciudad: true, estado: true, pais: true },
    })
    if (!ubicacion || ubicacion.ciudad !== ciudadFilter.ciudad || ubicacion.estado !== ciudadFilter.estado || ubicacion.pais !== ciudadFilter.pais) {
      throw new ForbiddenException('La ubicación seleccionada no pertenece a su ciudad')
    }
  }

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
        responsableId: user?.id, // Track who created it
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
         estado: { in: ['ABIERTA', 'APROBADA', 'EN_PROCESO'] },
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

  async actualizar(id: number, dto: UpdateLoteDto, user?: { id: number; rol: string }) {
    const lote = await this.obtener(id)

    // OPERADOR_INVENTARIO solo puede actualizar sus propios lotes
    if (user?.rol === 'OPERADOR_INVENTARIO' && lote.responsableId !== user.id) {
      throw new ForbiddenException('Solo puede actualizar lotes que usted creó')
    }

    return this.prisma.lote.update({
      where: { id },
      data: dto,
      include: this.include,
    })
  }

  async transferir(
    dto: TransferirLotesDto,
    user?: { id: number; rol: string },
    ciudadFilter: { ciudad: string; estado: string; pais: string } | null = null
  ) {
    // Only ADMIN and COORDINADOR_LOGISTICO can transfer lotes (operators cannot)
    if (user?.rol === 'OPERADOR_INVENTARIO') {
      throw new ForbiddenException('Operadores de inventario no pueden transferir lotes')
    }
    const lotes = await this.prisma.lote.findMany({
      where: { id: { in: dto.loteIds }, deletedAt: null },
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

    // If ciudadFilter is provided, validate that all lotes origen are in the user's city
    if (ciudadFilter) {
      const lotesConUbicacion = await this.prisma.lote.findMany({
        where: { id: { in: dto.loteIds } },
        select: { id: true, ubicacion: { select: { ciudad: true, estado: true, pais: true } } },
      })

      const lotesFueraCiudad = lotesConUbicacion.filter(lote =>
        lote.ubicacion.ciudad !== ciudadFilter.ciudad ||
        lote.ubicacion.estado !== ciudadFilter.estado ||
        lote.ubicacion.pais !== ciudadFilter.pais
      )

      if (lotesFueraCiudad.length > 0) {
        throw new ForbiddenException('Solo puede transferir lotes desde su ciudad')
      }
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

  async eliminar(id: number, user?: { id: number; rol: string }) {
    const lote = await this.prisma.lote.findUnique({
      where: { id },
      include: { detalleViajes: true, detalleRecepciones: true },
    })
    if (!lote) throw new NotFoundException('Lote no encontrado')

    // OPERADOR_INVENTARIO solo puede eliminar sus propios lotes
    if (user?.rol === 'OPERADOR_INVENTARIO' && lote.responsableId !== user.id) {
      throw new ForbiddenException('Solo puede eliminar lotes que usted creó')
    }

    const tieneTrazabilidad = lote.detalleViajes.length > 0 || lote.detalleRecepciones.length > 0

    if (tieneTrazabilidad) {
      await this.prisma.lote.update({
        where: { id },
        data: { deletedAt: new Date() },
      })
      return { ...lote, soft: true }
    }

    await this.prisma.$transaction([
      this.prisma.movimientoInventario.deleteMany({ where: { loteId: id } }),
      this.prisma.detalleViaje.deleteMany({ where: { loteId: id } }),
      this.prisma.detalleRecepcion.deleteMany({ where: { loteId: id } }),
      this.prisma.lote.delete({ where: { id } }),
    ])
    return { ...lote, soft: false }
  }
}
