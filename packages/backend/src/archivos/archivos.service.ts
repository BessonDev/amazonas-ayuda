import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common'
import { extname } from 'path'
import { PrismaService } from '../prisma/prisma.service'
import { MinioService } from '../common/minio/minio.service'

@Injectable()
export class ArchivosService {
  constructor(
    private prisma: PrismaService,
    private minio: MinioService,
  ) {}

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

    await this.minio.upload(filename, file.buffer, file.mimetype)

    return this.prisma.archivo.create({
      data: {
        nombre: `${dto.entidadTipo}-${dto.entidadId}-${Date.now()}${extname(file.originalname)}`,
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
    try {
      const stream = await this.minio.getStream(archivo.url)
      return new StreamableFile(stream, {
        disposition: `inline; filename="${sanitizeHeaderFilename(archivo.nombre)}"`,
        type: archivo.mimeType,
      })
    } catch {
      throw new NotFoundException('Archivo físico no encontrado en el almacenamiento')
    }
  }

  async eliminar(id: number) {
    const archivo = await this.obtener(id)
    await this.minio.remove(archivo.url)
    return this.prisma.archivo.delete({ where: { id } })
  }
}

function sanitizeHeaderFilename(name: string): string {
  return name.replace(/[^\x20-\x7E]/g, '').trim() || 'archivo'
}
