import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateSolicitudDto } from './dto/create-solicitud.dto'
import { UpdateSolicitudDto } from './dto/update-solicitud.dto'

@Injectable()
export class SolicitudesService {
  constructor(private prisma: PrismaService) {}

  private readonly include = {
    campania: true,
    ubicacion: true,
    detalles: {
      include: {
        producto: { include: { categoria: true } },
      },
    },
  }

  async listar() {
    return this.prisma.solicitud.findMany({
      include: this.include,
      orderBy: { createdAt: 'desc' },
    })
  }

  async obtener(id: number) {
    const solicitud = await this.prisma.solicitud.findUnique({
      where: { id },
      include: this.include,
    })
    if (!solicitud) throw new NotFoundException('Solicitud no encontrada')
    return solicitud
  }

  async crear(dto: CreateSolicitudDto) {
    return this.prisma.solicitud.create({
      data: {
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        prioridad: (dto.prioridad ?? 'MEDIA') as any,
        estado: (dto.estado ?? 'ABIERTA') as any,
        campaniaId: dto.campaniaId,
        ubicacionId: dto.ubicacionId,
        detalles: {
          createMany: {
            data: dto.detalles.map((d) => ({
              meta: d.meta,
              descripcion: d.descripcion,
              productoId: d.productoId,
            })),
          },
        },
      },
      include: this.include,
    })
  }

  async actualizar(id: number, dto: UpdateSolicitudDto) {
    await this.obtener(id)
    const data: any = {}
    if (dto.titulo !== undefined) data.titulo = dto.titulo
    if (dto.descripcion !== undefined) data.descripcion = dto.descripcion
    if (dto.prioridad !== undefined) data.prioridad = dto.prioridad
    if (dto.estado !== undefined) data.estado = dto.estado
    if (dto.campaniaId !== undefined) data.campaniaId = dto.campaniaId
    if (dto.ubicacionId !== undefined) data.ubicacionId = dto.ubicacionId
    return this.prisma.solicitud.update({
      where: { id },
      data,
      include: this.include,
    })
  }

  async eliminar(id: number) {
    await this.obtener(id)
    await this.prisma.solicitud.delete({ where: { id } })
  }
}
