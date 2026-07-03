import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { Response } from 'express'
import PDFDocument from 'pdfkit'

interface InventarioRow {
  productoId: bigint
  producto: string
  categoria: string
  ubicacionId: bigint
  ubicacion: string
  cantidad: bigint
  numLotes: bigint
  lotes: string
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

  async generarPDF(res: Response, ubicacionId?: number) {
    const data = await this.listar(ubicacionId)

    const ubicacionNombre = ubicacionId && data.length > 0
      ? data[0].ubicacion
      : null

    const titulo = ubicacionNombre
      ? `Inventario — ${ubicacionNombre}`
      : 'Inventario General'

    const columns = ['producto', 'categoria', 'cantidad', 'lotes', 'numLotes', 'ubicacion']
    const labels = ['Producto', 'Categoría', 'Cantidad', 'Lotes', '#', 'Ubicación']

    const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' })
    const filename = `inventario${ubicacionNombre ? `-${ubicacionNombre.toLowerCase().replace(/\s+/g, '-')}` : '-general'}-${Date.now()}.pdf`
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    })
    doc.pipe(res)

    const pageW = doc.page.width - 60
    const colWidths = columns.map((_, i) => {
      const labelW = labels[i].length * 6.5 + 12
      const dataW = Math.max(...data.map((r) => String(r[columns[i] as keyof typeof r] ?? '').length)) * 5 + 12
      return Math.max(labelW, dataW, 45)
    })
    const totalW = colWidths.reduce((a, b) => a + b, 0)
    if (totalW > pageW) {
      const ratio = pageW / totalW
      for (let i = 0; i < colWidths.length; i++) colWidths[i] = Math.floor(colWidths[i] * ratio)
    }

    doc.fontSize(18).font('Helvetica-Bold').fillColor('#1e293b').text(titulo, { align: 'center' })
    doc.moveDown(0.3)
    doc.fontSize(8).font('Helvetica').fillColor('#64748b').text(`Generado: ${new Date().toLocaleString('es-VE')}  |  Solo lotes DISPONIBLE`, { align: 'center' })
    doc.moveDown()

    if (data.length === 0) {
      doc.fontSize(12).fillColor('#64748b').text('No hay inventario disponible.', { align: 'center' })
      doc.end()
      return
    }

    const rowH = data.some((r) => r.lotes.length > 3) ? 28 : 18
    const headerBg = '#2563eb'
    const stripeEven = '#f8fafc'
    const stripeOdd = '#ffffff'
    const borderColor = '#cbd5e1'
    let y = doc.y

    const drawHeader = () => {
      doc.roundedRect(30, y - 4, pageW, rowH + 4, 3).fill(headerBg)
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#ffffff')
      let x = 30
      for (let i = 0; i < labels.length; i++) {
        doc.text(labels[i], x + 4, y + 2, { width: colWidths[i] - 8, align: i >= 2 ? 'right' : 'left' })
        x += colWidths[i]
      }
      y += rowH + 4
    }

    const drawRow = (row: Record<string, any>, idx: number) => {
      const rowH = Math.max(
        18,
        ...columns.map((col) => {
          const val = String(row[col] ?? '')
          const colIdx = columns.indexOf(col)
          return Math.ceil(val.length / Math.max(1, Math.floor((colWidths[colIdx] - 12) / 4.5))) * 10 + 8
        }),
      )

      if (y + rowH > doc.page.height - 40) {
        doc.addPage()
        y = doc.y
        drawHeader()
      }

      doc.fillColor(idx % 2 === 0 ? stripeEven : stripeOdd)
        .rect(30, y - 4, pageW, rowH)
        .fill()

      doc.fontSize(7.5).font('Helvetica').fillColor('#1e293b')
      let x = 30
      for (let i = 0; i < columns.length; i++) {
        const val = String(row[columns[i]] ?? '')
        doc.text(val, x + 4, y, {
          width: colWidths[i] - 8,
          align: i >= 2 ? 'right' : 'left',
          lineGap: -1,
        })
        x += colWidths[i]
      }

      doc.strokeColor(borderColor).lineWidth(0.5)
        .rect(30, y - 4, pageW, rowH).stroke()

      y += rowH
    }

    doc.fontSize(9).fillColor('#64748b').text(
      `${data.length} producto(s) en ${new Set(data.map((r) => r.ubicacion)).size} ubicación(es)`,
      { align: 'left' }
    )
    doc.moveDown(0.5)
    y = doc.y

    drawHeader()

    let totalCantidad = 0
    for (let i = 0; i < data.length; i++) {
      drawRow(data[i], i)
      totalCantidad += Number(data[i].cantidad ?? 0)
    }

    if (data.length > 0) {
      doc.moveDown(0.5)
      y = doc.y + 4
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#1e293b')
      let x = 30
      for (let i = 0; i < columns.length; i++) {
        const val = columns[i] === 'cantidad'
          ? String(totalCantidad)
          : columns[i] === 'numLotes'
            ? String(data.reduce((s: number, r: any) => s + Number(r.numLotes ?? 0), 0))
            : columns[i] === 'producto'
              ? 'TOTAL'
              : ''
        doc.text(val, x + 4, y, {
          width: colWidths[i] - 8,
          align: i >= 2 ? 'right' : 'left',
        })
        x += colWidths[i]
      }
    }

    doc.end()
  }
}
