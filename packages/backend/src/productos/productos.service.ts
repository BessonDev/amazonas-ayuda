import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateProductoDto } from './dto/create-producto.dto'
import { UpdateProductoDto } from './dto/update-producto.dto'

@Injectable()
export class ProductosService {
  constructor(private prisma: PrismaService) {}

  async listar() {
    const productos = await this.prisma.producto.findMany({
      include: { categoria: true },
      orderBy: { nombre: 'asc' },
    })

    const stocks = await this.prisma.$queryRaw<Array<{ producto_id: bigint; total: bigint }>>`
      SELECT l.producto_id, COALESCE(SUM(l.cantidad), 0) AS total
      FROM lotes l
      GROUP BY l.producto_id
    `
    const stockMap = new Map(stocks.map((s) => [Number(s.producto_id), Number(s.total)]))

    return productos.map((p) => ({
      ...p,
      stockTotal: stockMap.get(p.id) ?? 0,
    }))
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
