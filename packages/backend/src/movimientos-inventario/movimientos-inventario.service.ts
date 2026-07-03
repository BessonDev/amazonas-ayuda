import { Injectable, NotFoundException } from '@nestjs/common'
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

  listar() {
    return this.prisma.movimientoInventario.findMany({
      where: { deletedAt: null },
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

  async crear(dto: CreateMovimientoDto) {
    const ultimo = await this.prisma.movimientoInventario.findFirst({
      where: { loteId: dto.loteId, ubicacionId: dto.ubicacionId },
      orderBy: { createdAt: 'desc' },
    })

    const saldoAnterior = ultimo?.saldoNuevo ?? 0
    const esEntrada = TIPOS_ENTRADA.includes(dto.tipo)
    const saldoNuevo = esEntrada
      ? saldoAnterior + dto.cantidad
      : saldoAnterior - dto.cantidad

    return this.prisma.movimientoInventario.create({
      data: {
        tipo: dto.tipo as any,
        cantidad: dto.cantidad,
        saldoAnterior,
        saldoNuevo,
        observaciones: dto.observaciones,
        loteId: dto.loteId,
        ubicacionId: dto.ubicacionId,
        campaniaId: dto.campaniaId,
      },
      include: this.include,
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
      include: this.include,
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
