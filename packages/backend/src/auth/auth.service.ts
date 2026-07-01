import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { Response } from 'express'
import { PrismaService } from '../prisma/prisma.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'

@Injectable()
export class AuthService {
  private readonly accessTokenExp: number
  private readonly refreshTokenExp: number

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.accessTokenExp = 15 * 60 // 15 min en segundos
    this.refreshTokenExp = 7 * 24 * 60 * 60 // 7 días en segundos
  }

  async login(dto: LoginDto, res: Response) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
      include: { rol: true },
    })

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Credenciales inválidas')
    }

    const passwordValida = await bcrypt.compare(dto.password, usuario.passwordHash)
    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales inválidas')
    }

    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: { ultimoAcceso: new Date() },
    })

    return this.generarTokens(usuario, res)
  }

  async register(dto: RegisterDto, res: Response) {
    const existe = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    })

    if (existe) {
      throw new ConflictException('El email ya está registrado')
    }

    const passwordHash = await bcrypt.hash(dto.password, 10)

    const usuario = await this.prisma.usuario.create({
      data: {
        nombre: dto.nombre,
        email: dto.email,
        passwordHash,
        telefono: dto.telefono,
        rolId: 4, // RESPONSABLE_DESTINO por defecto
      },
      include: { rol: true },
    })

    return this.generarTokens(usuario, res)
  }

  async refresh(refreshToken: string, res: Response) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET')!,
      })

      const usuario = await this.prisma.usuario.findUnique({
        where: { id: payload.sub },
        include: { rol: true },
      })

      if (!usuario || !usuario.activo) {
        throw new UnauthorizedException('Usuario no válido')
      }

      return this.generarTokens(usuario, res)
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado')
    }
  }

  async logout(res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })

    return { mensaje: 'Sesión cerrada exitosamente' }
  }

  private async generarTokens(usuario: any, res: Response) {
    const payload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol.nombre,
    }

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.accessTokenExp,
    })

    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET')!
    const refreshToken = this.jwtService.sign(
      { sub: usuario.id },
      { secret: refreshSecret, expiresIn: this.refreshTokenExp },
    )

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 min
      path: '/',
    })

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      path: '/',
    })

    return {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol.nombre,
      accessToken,
    }
  }
}
