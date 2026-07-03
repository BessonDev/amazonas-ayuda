import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { InventarioService } from '../inventario/inventario.service'
import PDFDocument from 'pdfkit'
import * as ExcelJS from 'exceljs'
import { Response } from 'express'

@Injectable()
export class ReportesService {
  constructor(
    private prisma: PrismaService,
    private inventarioService: InventarioService,
  ) {}

  async generarInventario(formato: 'pdf' | 'excel', res: Response) {
    const data = await this.inventarioService.listar()

    const mapped = data.map((r) => ({
      producto: r.producto,
      categoria: r.categoria,
      cantidad: r.cantidad,
      lotes: r.lotes.join(', '),
      numLotes: r.numLotes,
      ubicacion: r.ubicacion,
    }))

    if (formato === 'pdf') {
      return this.enviarPDFInventario(res, mapped)
    }
    return this.enviarExcel(res, 'inventario', 'Reporte de Inventario', mapped)
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

  private readonly columnLabels: Record<string, string> = {
    ubicacion: 'Ubicación',
    producto: 'Producto',
    categoria: 'Categoría',
    cantidad: 'Cantidad',
    lotes: 'Lotes',
    numLotes: '#',
    codigo: 'Código',
    donante: 'Donante',
    campania: 'Campaña',
    fecha: 'Fecha',
    estado: 'Estado',
    origen: 'Origen',
    destino: 'Destino',
    vehiculo: 'Vehículo',
    conductor: 'Conductor',
    responsable: 'Responsable',
    fechaSalida: 'Fecha Salida',
    fechaEstimada: 'Fecha Est. Llegada',
  }

  private enviarPDFInventario(res: Response, data: Record<string, any>[]) {
    const columns = ['producto', 'categoria', 'cantidad', 'lotes', 'numLotes', 'ubicacion']
    const labels = columns.map((c) => this.columnLabels[c] ?? c)
    this.renderTablaPDF(res, 'Reporte de Inventario', columns, labels, data)
  }

  private enviarPDF(res: Response, filename: string, titulo: string, data: Record<string, any>[]) {
    const columns = Object.keys(data[0] ?? {})
    const labels = columns.map((c) => this.columnLabels[c] ?? c)
    this.renderTablaPDF(res, titulo, columns, labels, data)
  }

  private renderTablaPDF(
    res: Response,
    titulo: string,
    columns: string[],
    labels: string[],
    data: Record<string, any>[],
  ) {
    const doc = new PDFDocument({ margin: 30, size: 'A4', layout: columns.length > 4 ? 'landscape' : 'portrait' })
    const filename = titulo.toLowerCase().replace(/\s+/g, '-')
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}-${Date.now()}.pdf"`,
    })
    doc.pipe(res)

    const pageW = doc.page.width - 60
    const colWidths = columns.map((_, i) => {
      const labelW = labels[i].length * 6 + 12
      const dataW = Math.max(...data.map((r) => String(r[columns[i]] ?? '').length)) * 5 + 12
      return Math.max(labelW, dataW, 40)
    })
    const totalW = colWidths.reduce((a, b) => a + b, 0)
    if (totalW > pageW) {
      const ratio = pageW / totalW
      for (let i = 0; i < colWidths.length; i++) colWidths[i] = Math.floor(colWidths[i] * ratio)
    }

    doc.fontSize(16).font('Helvetica-Bold').text(titulo, { align: 'center' })
    doc.moveDown(0.5)
    doc.fontSize(8).font('Helvetica').text(`Generado: ${new Date().toLocaleString('es-VE')}`, { align: 'right' })
    doc.moveDown()

    if (data.length === 0) {
      doc.fontSize(12).text('No hay datos disponibles.', { align: 'center' })
      doc.end()
      return
    }

    const rowH = 16
    const headerBg = '#2563eb'
    const stripeEven = '#f8fafc'
    const stripeOdd = '#ffffff'
    const borderColor = '#cbd5e1'
    let y = doc.y

    const drawHeader = () => {
      doc.roundedRect(30, y - 4, pageW, rowH, 3).fill(headerBg)
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#ffffff')
      let x = 30
      for (let i = 0; i < labels.length; i++) {
        doc.text(labels[i], x + 4, y, { width: colWidths[i] - 8, align: 'left' })
        x += colWidths[i]
      }
      y += rowH
    }

    const drawRow = (row: Record<string, any>, idx: number) => {
      if (y + rowH > doc.page.height - 40) {
        doc.addPage()
        y = doc.y
        drawHeader()
      }

      doc.fillColor(idx % 2 === 0 ? stripeEven : stripeOdd)
        .rect(30, y - 4, pageW, rowH)
        .fill()

      doc.fontSize(8).font('Helvetica').fillColor('#1e293b')
      let x = 30
      for (let i = 0; i < columns.length; i++) {
        const val = String(row[columns[i]] ?? '')
        doc.text(val, x + 4, y, { width: colWidths[i] - 8, align: i === columns.length - 1 ? 'right' : 'left' })
        x += colWidths[i]
      }

      doc.strokeColor(borderColor).lineWidth(0.5)
        .rect(30, y - 4, pageW, rowH).stroke()

      y += rowH
    }

    drawHeader()

    let total = 0
    const cantIdx = columns.indexOf('cantidad')
    for (let i = 0; i < data.length; i++) {
      drawRow(data[i], i)
      if (cantIdx >= 0) total += Number(data[i].cantidad ?? 0)
    }

    if (cantIdx >= 0 && data.length > 1) {
      doc.moveDown(0.5)
      y = doc.y + 4
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#1e293b')
      let x = 30
      for (let i = 0; i < columns.length; i++) {
        const val = i === cantIdx ? String(total) : i === columns.length - 1 ? 'TOTAL' : ''
        doc.text(val, x + 4, y, { width: colWidths[i] - 8, align: i === columns.length - 1 ? 'right' : 'left' })
        x += colWidths[i]
      }
    }

    doc.end()
  }

  private async enviarExcel(res: Response, filename: string, titulo: string, data: Record<string, any>[]) {
    const keys = Object.keys(data[0] ?? {})
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet(titulo)

    sheet.columns = keys.map((key) => ({
      header: this.columnLabels[key] ?? key,
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
