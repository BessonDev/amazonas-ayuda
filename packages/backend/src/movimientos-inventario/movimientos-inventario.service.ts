import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateMovimientoDto } from './dto/create-movimiento.dto'
import { UpdateMovimientoDto } from './dto/update-movimiento.dto'

const TIPOS_ENTRADA = ['ENTRADA', 'RECEPCION']

@Injectable()
export class MovimientosInventarioService {
  constructor(private prisma: PrismaService) {}

  private readonly include = {
    lote: true,
    ubicacion: true,
  }

  listar(ciudadFilter: { ciudad: string; estado: string; pais: string } | null = null) {
    const where: any = { deletedAt: null }

    if (ciudadFilter) {
      where.ubicacion = {
        ciudad: ciudadFilter.ciudad,
        estado: ciudadFilter.estado,
        pais: ciudadFilter.pais,
      }
    }

    return this.prisma.movimientoInventario.findMany({
      where,
      include: this.include,
      orderBy: { createdAt: 'desc' },
    })
  }

  async obtener(id: number) {
    const mov = await this.prisma.movimientoInventario.findUnique({
      where: { id },
      include: this.include,
    })
    if (!mov) throw new NotFoundException('Movimiento no encontrado')
    return mov
  }

  async crear(dto: CreateMovimientoDto, user?: { id: number; rol: string }, ciudadFilter: { ciudad: string; estado: string; pais: string } | null = null) {
    // Validate city for operators
    if (ciudadFilter && user?.rol === 'OPERADOR_INVENTARIO') {
      if (!dto.ubicacionId) {
        throw new ForbiddenException('Debe especificar una ubicación para el movimiento')
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
      const ultimo = await tx.movimientoInventario.findFirst({
        where: { loteId: dto.loteId, ubicacionId: dto.ubicacionId },
        orderBy: { createdAt: 'desc' },
      })

      const saldoAnterior = ultimo?.saldoNuevo ?? 0
      const esEntrada = TIPOS_ENTRADA.includes(dto.tipo)
      const saldoNuevo = esEntrada
        ? saldoAnterior + dto.cantidad
        : saldoAnterior - dto.cantidad

      const movimiento = await tx.movimientoInventario.create({
        data: {
          tipo: dto.tipo as any,
          cantidad: dto.cantidad,
          saldoAnterior,
          saldoNuevo: esEntrada ? saldoAnterior + dto.cantidad : saldoAnterior - dto.cantidad,
          observaciones: dto.observaciones,
          loteId: dto.loteId,
          ubicacionId: dto.ubicacionId,
          campaniaId: dto.campaniaId,
        },
        include: { lote: true, ubicacion: true },
      })

      // AJUSTE: actualizar cantidad del lote
      if (dto.tipo === 'AJUSTE') {
        const lote = await tx.lote.findUnique({ where: { id: dto.loteId } })
        if (lote) {
          await tx.lote.update({
            where: { id: dto.loteId },
            data: { cantidad: Math.max(0, lote.cantidad - dto.cantidad) },
          })
        }
      }

      return movimiento
    })
  }

  async actualizar(id: number, dto: UpdateMovimientoDto) {
    await this.obtener(id)
    return this.prisma.movimientoInventario.update({
      where: { id },
      data: {
        tipo: dto.tipo as any,
        cantidad: dto.cantidad,
        observaciones: dto.observaciones,
        loteId: dto.loteId,
        ubicacionId: dto.ubicacionId,
        campaniaId: dto.campaniaId,
      },
      include: { lote: true, ubicacion: true },
    })
  }

  async eliminar(id: number) {
    await this.obtener(id)
    return this.prisma.movimientoInventario.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }
}
