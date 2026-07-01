import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateUbicacionDto } from './dto/create-ubicacion.dto'
import { UpdateUbicacionDto } from './dto/update-ubicacion.dto'

@Injectable()
export class UbicacionesService {
  constructor(private prisma: PrismaService) {}

  listar() {
    return this.prisma.ubicacion.findMany({
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

  async actualizar(id: number, dto: UpdateUbicacionDto) {
    await this.obtener(id)
    return this.prisma.ubicacion.update({
      where: { id },
      data: dto,
      include: { tipo: true },
    })
  }
}
