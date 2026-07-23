import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateUbicacionDto } from './dto/create-ubicacion.dto'
import { UpdateUbicacionDto } from './dto/update-ubicacion.dto'

@Injectable()
export class UbicacionesService {
  constructor(private prisma: PrismaService) {}

  listar(ciudadFilter: { ciudad: string; estado: string; pais: string } | null = null) {
    return this.prisma.ubicacion.findMany({
      where: ciudadFilter
        ? { ciudad: ciudadFilter.ciudad, estado: ciudadFilter.estado, pais: ciudadFilter.pais }
        : undefined,
      include: { tipo: true },
      orderBy: { nombre: 'asc' },
    })
  }

  async obtener(id: number) {
    const ubicacion = await this.prisma.ubicacion.findUnique({
      where: { id },
      include: { tipo: true },
    })
    if (!ubicacion) throw new NotFoundException('Ubicación no encontrada')
    return ubicacion
  }

  crear(dto: CreateUbicacionDto) {
    return this.prisma.ubicacion.create({
      data: dto,
      include: { tipo: true },
    })
  }

  listarTipos() {
    return this.prisma.tipoUbicacion.findMany({ orderBy: { nombre: 'asc' } })
  }

  async actualizar(id: number, dto: UpdateUbicacionDto) {
    await this.obtener(id)
    return this.prisma.ubicacion.update({
      where: { id },
      data: dto,
      include: { tipo: true },
    })
  }

  async listarCiudades(ciudadFilter: { ciudad: string; estado: string; pais: string } | null = null) {
    const rows = await this.prisma.ubicacion.findMany({
      where: ciudadFilter
        ? { ciudad: ciudadFilter.ciudad, estado: ciudadFilter.estado, pais: ciudadFilter.pais }
        : undefined,
      select: { ciudad: true },
      distinct: ['ciudad'],
      orderBy: { ciudad: 'asc' },
    })
    return rows.map((r) => r.ciudad)
  }

  async eliminar(id: number) {
    await this.obtener(id)
    return this.prisma.ubicacion.delete({ where: { id } })
  }
}
