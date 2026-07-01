import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateProductoDto } from './dto/create-producto.dto'
import { UpdateProductoDto } from './dto/update-producto.dto'

@Injectable()
export class ProductosService {
  constructor(private prisma: PrismaService) {}

  listar() {
    return this.prisma.producto.findMany({
      include: { categoria: true },
      orderBy: { nombre: 'asc' },
    })
  }

  async obtener(id: number) {
    const producto = await this.prisma.producto.findUnique({
      where: { id },
      include: { categoria: true },
    })
    if (!producto) throw new NotFoundException('Producto no encontrado')
    return producto
  }

  crear(dto: CreateProductoDto) {
    return this.prisma.producto.create({
      data: {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        categoriaId: dto.categoriaId,
        unidad: dto.unidad as any,
      },
      include: { categoria: true },
    })
  }

  async actualizar(id: number, dto: UpdateProductoDto) {
    await this.obtener(id)
    return this.prisma.producto.update({
      where: { id },
      data: {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        unidad: dto.unidad as any,
      },
      include: { categoria: true },
    })
  }

  async eliminar(id: number) {
    await this.obtener(id)
    return this.prisma.producto.delete({ where: { id } })
  }
}
