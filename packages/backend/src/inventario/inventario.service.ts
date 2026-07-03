import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'

interface InventarioRow {
  productoId: bigint
  producto: string
  categoria: string
  ubicacionId: bigint
  ubicacion: string
  cantidad: bigint
  numLotes: bigint
  lotes: string | null
}

export interface InventarioItem {
  productoId: number
  producto: string
  categoria: string
  ubicacionId: number
  ubicacion: string
  cantidad: number
  numLotes: number
  lotes: string[]
}

@Injectable()
export class InventarioService {
  constructor(private prisma: PrismaService) {}

  async listar(ubicacionId?: number): Promise<InventarioItem[]> {
    const whereLote = ubicacionId
      ? Prisma.sql`AND l."ubicacionId" = ${ubicacionId}`
      : Prisma.sql``

    const whereUbicacion = ubicacionId
      ? Prisma.sql`AND u.id = ${ubicacionId}`
      : Prisma.sql``

    const rows = await this.prisma.$queryRaw<InventarioRow[]>`
      SELECT
        p.id AS "productoId",
        p.nombre AS producto,
        c.nombre AS categoria,
        u.id AS "ubicacionId",
        u.nombre AS ubicacion,
        COALESCE(SUM(l.cantidad), 0) AS cantidad,
        COUNT(l.id) AS "numLotes",
        COALESCE(string_agg(l.codigo, ', ' ORDER BY l.codigo), '') AS lotes
      FROM productos p
      JOIN categorias c ON c.id = p."categoriaId"
      CROSS JOIN ubicaciones u
      LEFT JOIN lotes l
        ON l."productoId" = p.id
        AND l."ubicacionId" = u.id
        AND l."deleted_at" IS NULL
        AND l.estado = 'DISPONIBLE'
        ${whereLote}
      WHERE u.activo = true
        ${whereUbicacion}
      GROUP BY p.id, p.nombre, c.nombre, u.id, u.nombre
      HAVING COALESCE(SUM(l.cantidad), 0) > 0
      ORDER BY u.nombre, c.nombre, p.nombre
    `

    return rows.map((r) => ({
      productoId: Number(r.productoId),
      producto: r.producto,
      categoria: r.categoria,
      ubicacionId: Number(r.ubicacionId),
      ubicacion: r.ubicacion,
      cantidad: Number(r.cantidad),
      numLotes: Number(r.numLotes),
      lotes: r.lotes ? r.lotes.split(', ') : [],
    }))
  }
}
