import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import PDFDocument from 'pdfkit'
import * as ExcelJS from 'exceljs'
import { Response } from 'express'

@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService) {}

  async generarInventario(formato: 'pdf' | 'excel', res: Response) {
    const data = await this.prisma.$queryRaw<Array<{
      ubicacion: string
      producto: string
      categoria: string
      cantidad: number
    }>>`
      SELECT
        u.nombre AS ubicacion,
        p.nombre AS producto,
        c.nombre AS categoria,
        COALESCE((
          SELECT m.saldo_nuevo
          FROM movimientos_inventario m
          WHERE m.ubicacion_id = u.id AND m.producto_id = p.id
          ORDER BY m.created_at DESC
          LIMIT 1
        ), 0) AS cantidad
      FROM ubicaciones u
      CROSS JOIN productos p
      JOIN categorias c ON c.id = p.categoria_id
      WHERE u.activo = true
      ORDER BY u.nombre, c.nombre, p.nombre
    `

    if (formato === 'pdf') {
      return this.enviarPDF(res, 'inventario', 'Reporte de Inventario', data)
    }
    return this.enviarExcel(res, 'inventario', 'Reporte de Inventario', data)
  }

  async generarDonaciones(formato: 'pdf' | 'excel', res: Response) {
    const data = await this.prisma.lote.findMany({
      where: { estado: { in: ['DISPONIBLE', 'EN_TRANSITO', 'ENTREGADO'] } },
      include: {
        producto: { include: { categoria: true } },
        donante: true,
        campania: true,
        ubicacion: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const rows = data.map((l) => ({
      codigo: l.codigo,
      producto: l.producto.nombre,
      categoria: l.producto.categoria.nombre,
      cantidad: l.cantidad,
      donante: l.donante?.nombre ?? 'Anónimo',
      ubicacion: l.ubicacion.nombre,
      campania: l.campania.nombre,
      fecha: l.createdAt.toISOString().split('T')[0],
      estado: l.estado,
    }))

    if (formato === 'pdf') {
      return this.enviarPDF(res, 'donaciones', 'Reporte de Donaciones', rows)
    }
    return this.enviarExcel(res, 'donaciones', 'Reporte de Donaciones', rows)
  }

  async generarViajes(formato: 'pdf' | 'excel', res: Response) {
    const data = await this.prisma.viaje.findMany({
      include: {
        origen: true,
        destino: true,
        campania: true,
        responsable: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const rows = data.map((v) => ({
      codigo: v.codigo,
      origen: v.origen.nombre,
      destino: v.destino.nombre,
      estado: v.estado,
      vehiculo: v.vehiculo ?? '-',
      conductor: v.conductor ?? '-',
      responsable: v.responsable?.nombre ?? '-',
      fechaSalida: v.fechaSalida?.toISOString().split('T')[0] ?? '-',
      fechaEstimada: v.fechaEstimada?.toISOString().split('T')[0] ?? '-',
      campania: v.campania.nombre,
    }))

    if (formato === 'pdf') {
      return this.enviarPDF(res, 'viajes', 'Reporte de Viajes', rows)
    }
    return this.enviarExcel(res, 'viajes', 'Reporte de Viajes', rows)
  }

  private enviarPDF(res: Response, filename: string, titulo: string, data: Record<string, any>[]) {
    const doc = new PDFDocument({ margin: 30, size: 'A4' })
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}-${Date.now()}.pdf"`,
    })
    doc.pipe(res)

    doc.fontSize(18).font('Helvetica-Bold').text(titulo, { align: 'center' })
    doc.moveDown()
    doc.fontSize(9).font('Helvetica').text(`Generado: ${new Date().toLocaleString('es-VE')}`, { align: 'right' })
    doc.moveDown()

    if (data.length === 0) {
      doc.fontSize(12).text('No hay datos disponibles.', { align: 'center' })
      doc.end()
      return
    }

    const columns = Object.keys(data[0])
    const colWidth = Math.min(80, Math.floor((doc.page.width - 60) / columns.length))

    doc.fontSize(8).font('Helvetica-Bold')
    let y = doc.y
    for (let i = 0; i < columns.length; i++) {
      doc.text(columns[i], 30 + i * colWidth, y, { width: colWidth, align: 'left' })
    }
    doc.moveDown(0.5)

    doc.fontSize(7).font('Helvetica')
    for (const row of data) {
      y = doc.y
      if (y > doc.page.height - 60) {
        doc.addPage()
        y = doc.y
      }
      const values = columns.map((c) => String(row[c] ?? ''))
      for (let i = 0; i < values.length; i++) {
        doc.text(values[i], 30 + i * colWidth, y, { width: colWidth, align: 'left' })
      }
      doc.moveDown(0.3)
    }

    doc.end()
  }

  private async enviarExcel(res: Response, filename: string, titulo: string, data: Record<string, any>[]) {
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet(titulo)

    sheet.columns = Object.keys(data[0] ?? {}).map((key) => ({
      header: key,
      key,
      width: 20,
    }))

    sheet.addRows(data)

    sheet.getRow(1).font = { bold: true }
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    }

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}-${Date.now()}.xlsx"`,
    })

    await workbook.xlsx.write(res)
    res.end()
  }
}
