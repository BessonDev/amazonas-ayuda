import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateCampaniaDto } from './dto/create-campania.dto'
import { UpdateCampaniaDto } from './dto/update-campania.dto'

@Injectable()
export class CampaniasService {
  constructor(private prisma: PrismaService) {}

  listar() {
    return this.prisma.campania.findMany({
      orderBy: { createdAt: 'desc' },
    })
  }

  async obtener(id: number) {
    const campania = await this.prisma.campania.findUnique({
      where: { id },
    })
    if (!campania) throw new NotFoundException('Campaña no encontrada')
    return campania
  }

  crear(dto: CreateCampaniaDto) {
    return this.prisma.campania.create({
      data: {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        imagenUrl: dto.imagenUrl,
        objetivo: dto.objetivo,
        fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : undefined,
        fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : undefined,
        estado: (dto.estado as any) ?? 'PLANIFICADA',
      },
    })
  }

  async actualizar(id: number, dto: UpdateCampaniaDto) {
    await this.obtener(id)
    return this.prisma.campania.update({
      where: { id },
      data: {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        imagenUrl: dto.imagenUrl,
        objetivo: dto.objetivo,
        fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : undefined,
        fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : undefined,
        estado: dto.estado as any,
      },
    })
  }
}
