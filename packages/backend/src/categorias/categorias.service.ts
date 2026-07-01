import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateCategoriaDto } from './dto/create-categoria.dto'
import { UpdateCategoriaDto } from './dto/update-categoria.dto'

@Injectable()
export class CategoriasService {
  constructor(private prisma: PrismaService) {}

  listar() {
    return this.prisma.categoria.findMany({ orderBy: { nombre: 'asc' } })
  }

  async obtener(id: number) {
    const categoria = await this.prisma.categoria.findUnique({ where: { id } })
    if (!categoria) throw new NotFoundException('Categoría no encontrada')
    return categoria
  }

  crear(dto: CreateCategoriaDto) {
    return this.prisma.categoria.create({ data: dto })
  }

  async actualizar(id: number, dto: UpdateCategoriaDto) {
    await this.obtener(id)
    return this.prisma.categoria.update({ where: { id }, data: dto })
  }

  async eliminar(id: number) {
    await this.obtener(id)
    return this.prisma.categoria.delete({ where: { id } })
  }
}
