import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateLoteDto } from './dto/create-lote.dto'
import { UpdateLoteDto } from './dto/update-lote.dto'
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

  async listar() {
    return this.prisma.lote.findMany({
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

      return lote
    })
  }

  async actualizar(id: number, dto: UpdateLoteDto) {
    await this.obtener(id)
    return this.prisma.lote.update({
      where: { id },
      data: dto,
      include: this.include,
    })
  }

  async eliminar(id: number) {
    await this.obtener(id)
    await this.prisma.lote.delete({ where: { id } })
  }
}
