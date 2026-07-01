import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateDonanteDto } from './dto/create-donante.dto'
import { UpdateDonanteDto } from './dto/update-donante.dto'

@Injectable()
export class DonantesService {
  constructor(private prisma: PrismaService) {}

  listar() {
    return this.prisma.donante.findMany({ orderBy: { createdAt: 'desc' } })
  }

  async obtener(id: number) {
    const donante = await this.prisma.donante.findUnique({ where: { id } })
    if (!donante) throw new NotFoundException('Donante no encontrado')
    return donante
  }

  crear(dto: CreateDonanteDto) {
    return this.prisma.donante.create({
      data: {
        tipo: dto.tipo as any,
        nombre: dto.nombre,
        documento: dto.documento,
        email: dto.email,
        telefono: dto.telefono,
      },
    })
  }

  async actualizar(id: number, dto: UpdateDonanteDto) {
    await this.obtener(id)
    return this.prisma.donante.update({
      where: { id },
      data: {
        tipo: dto.tipo as any,
        nombre: dto.nombre,
        documento: dto.documento,
        email: dto.email,
        telefono: dto.telefono,
      },
    })
  }
}
