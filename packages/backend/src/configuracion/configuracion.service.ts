import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateConfiguracionDto } from './dto/create-configuracion.dto'
import { UpdateConfiguracionDto } from './dto/update-configuracion.dto'

@Injectable()
export class ConfiguracionService {
  constructor(private prisma: PrismaService) {}

  async listar() {
    return this.prisma.configuracion.findMany({ orderBy: { clave: 'asc' } })
  }

  async obtener(id: number) {
    const conf = await this.prisma.configuracion.findUnique({ where: { id } })
    if (!conf) throw new NotFoundException('Configuración no encontrada')
    return conf
  }

  async obtenerPorClave(clave: string) {
    const conf = await this.prisma.configuracion.findUnique({ where: { clave } })
    if (!conf) throw new NotFoundException('Configuración no encontrada')
    return conf
  }

  async crear(dto: CreateConfiguracionDto) {
    const existente = await this.prisma.configuracion.findUnique({ where: { clave: dto.clave } })
    if (existente) throw new ConflictException('La clave ya existe')
    return this.prisma.configuracion.create({ data: dto })
  }

  async actualizar(id: number, dto: UpdateConfiguracionDto) {
    await this.obtener(id)
    return this.prisma.configuracion.update({ where: { id }, data: dto })
  }

  async eliminar(id: number) {
    await this.obtener(id)
    await this.prisma.configuracion.delete({ where: { id } })
  }
}
