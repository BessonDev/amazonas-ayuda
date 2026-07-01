import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common'
import { createReadStream, existsSync, mkdirSync } from 'fs'
import { writeFile, unlink } from 'fs/promises'
import { join, extname } from 'path'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ArchivosService {
  private readonly uploadDir: string

  constructor(private prisma: PrismaService) {
    this.uploadDir = join(__dirname, '..', '..', '..', 'uploads')
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true })
    }
  }

  private readonly include = {
    campania: true,
    viaje: true,
  }

  async listar(entidadTipo?: string, entidadId?: number) {
    const where: any = {}
    if (entidadTipo) where.entidadTipo = entidadTipo
    if (entidadId) where.entidadId = entidadId
    return this.prisma.archivo.findMany({ where, include: this.include, orderBy: { createdAt: 'desc' } })
  }

  async obtener(id: number) {
    const archivo = await this.prisma.archivo.findUnique({
      where: { id },
      include: this.include,
    })
    if (!archivo) throw new NotFoundException('Archivo no encontrado')
    return archivo
  }

  async crear(file: Express.Multer.File, dto: { nombre: string; entidadTipo: string; entidadId: number; campaniaId?: number; viajeId?: number }) {
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${extname(file.originalname)}`
    const filepath = join(this.uploadDir, filename)

    await writeFile(filepath, file.buffer)

    return this.prisma.archivo.create({
      data: {
        nombre: dto.nombre || file.originalname,
        url: filename,
        mimeType: file.mimetype,
        tamanio: file.size,
        entidadTipo: dto.entidadTipo,
        entidadId: dto.entidadId,
        campaniaId: dto.campaniaId,
        viajeId: dto.viajeId,
      },
      include: this.include,
    })
  }

  async descargar(id: number) {
    const archivo = await this.obtener(id)
    const filepath = join(this.uploadDir, archivo.url)
    if (!existsSync(filepath)) throw new NotFoundException('Archivo físico no encontrado')
    const stream = createReadStream(filepath)
    return new StreamableFile(stream, {
      disposition: `attachment; filename="${archivo.nombre}"`,
      type: archivo.mimeType,
    })
  }

  async eliminar(id: number) {
    const archivo = await this.obtener(id)
    const filepath = join(this.uploadDir, archivo.url)
    try { await unlink(filepath) } catch {}
    await this.prisma.archivo.delete({ where: { id } })
  }
}
