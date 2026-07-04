import { Injectable, NotFoundException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../prisma/prisma.service'
import { CreateUsuarioDto } from './dto/create-usuario.dto'
import { UpdateUsuarioDto } from './dto/update-usuario.dto'

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async listar() {
    return this.prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        activo: true,
        ultimoAcceso: true,
        createdAt: true,
        ubicacionId: true,
        rol: { select: { id: true, nombre: true } },
      },
      orderBy: { id: 'asc' },
    })
  }

  async obtener(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        activo: true,
        ultimoAcceso: true,
        createdAt: true,
        ubicacionId: true,
        rol: { select: { id: true, nombre: true } },
      },
    })

    if (!usuario) throw new NotFoundException('Usuario no encontrado')
    return usuario
  }

  async crear(dto: CreateUsuarioDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10)

    return this.prisma.usuario.create({
      data: {
        nombre: dto.nombre,
        email: dto.email,
        passwordHash,
        telefono: dto.telefono,
        rolId: dto.rolId,
        ubicacionId: dto.ubicacionId,
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        activo: true,
        createdAt: true,
        ubicacionId: true,
        rol: { select: { id: true, nombre: true } },
      },
    })
  }

  async actualizar(id: number, dto: UpdateUsuarioDto) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } })
    if (!usuario) throw new NotFoundException('Usuario no encontrado')

    const data: any = { ...dto }
    if (dto.password) {
      data.passwordHash = await bcrypt.hash(dto.password, 10)
      delete data.password
    } else {
      delete data.password
    }

    return this.prisma.usuario.update({
      where: { id },
      data,
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        activo: true,
        createdAt: true,
        ubicacionId: true,
        rol: { select: { id: true, nombre: true } },
      },
    })
  }

  async desactivar(id: number) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } })
    if (!usuario) throw new NotFoundException('Usuario no encontrado')

    return this.prisma.usuario.update({
      where: { id },
      data: { activo: false },
      select: {
        id: true,
        nombre: true,
        email: true,
        activo: true,
        rol: { select: { id: true, nombre: true } },
      },
    })
  }

  async getRoles() {
    return this.prisma.rol.findMany({
      select: { id: true, nombre: true, descripcion: true },
      orderBy: { id: 'asc' },
    })
  }
}
