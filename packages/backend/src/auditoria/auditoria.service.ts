import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { ConsultaAuditoriaDto } from './dto/consulta-auditoria.dto'

@Injectable()
export class AuditoriaService {
  constructor(private prisma: PrismaService) {}

  async crear(params: {
    usuarioId?: number | null
    accion: string
    entidadTipo: string
    entidadId?: number | null
    valorAnterior?: string | null
    valorNuevo?: string | null
    ip?: string | null
    campaniaId?: number | null
  }) {
    return this.prisma.auditoria.create({ data: params })
  }

  async listar(filtros: ConsultaAuditoriaDto) {
    const where: any = {}
    if (filtros.entidadTipo) where.entidadTipo = filtros.entidadTipo
    if (filtros.entidadId) where.entidadId = filtros.entidadId
    if (filtros.usuarioId) where.usuarioId = filtros.usuarioId
    if (filtros.accion) where.accion = { contains: filtros.accion, mode: 'insensitive' }
    if (filtros.desde || filtros.hasta) {
      where.createdAt = {}
      if (filtros.desde) where.createdAt.gte = new Date(filtros.desde)
      if (filtros.hasta) where.createdAt.lte = new Date(filtros.hasta)
    }

    return this.prisma.auditoria.findMany({
      where,
      include: { usuario: { select: { id: true, nombre: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    })
  }

  async obtener(id: number) {
    return this.prisma.auditoria.findUnique({
      where: { id },
      include: { usuario: { select: { id: true, nombre: true, email: true } } },
    })
  }
}
