import type { StrategyOptionsWithoutRequest } from 'passport-jwt'
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Request } from 'express'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../prisma/prisma.service'

interface JwtPayload {
  sub: number
  email: string
  rol: string
  ciudad?: string
  estado?: string
  pais?: string
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(ConfigService) configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.access_token ?? null,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: configService.get<string>('JWT_SECRET'),
    } as StrategyOptionsWithoutRequest)
  }

  async validate(payload: JwtPayload) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: payload.sub },
      include: { rol: true, ubicacion: true },
    })

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Usuario no encontrado o inactivo')
    }

     return {
       id: usuario.id,
       email: usuario.email,
       nombre: usuario.nombre,
       rol: usuario.rol.nombre,
       rolId: usuario.rolId,
       ubicacionId: usuario.ubicacionId,
       ciudad: usuario.ubicacion?.ciudad ?? null,
       estado: usuario.ubicacion?.estado ?? null,
       pais: usuario.ubicacion?.pais ?? 'Venezuela',
     }
  }
}
