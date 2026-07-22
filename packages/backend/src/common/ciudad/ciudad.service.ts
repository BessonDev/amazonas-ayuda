import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CiudadService {
  constructor(private prisma: PrismaService) {}

  async getUserCiudad(userId: number) {
    const u = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: { ubicacion: { select: { ciudad: true, estado: true, pais: true } } },
    });
    return u?.ubicacion ?? null;
  }

  // For reading directly from JWT (no extra query)
  getCiudadFromUser(user: any) {
    if (!user?.ciudad || !user?.estado) return null;
    return { ciudad: user.ciudad, estado: user.estado, pais: user.pais ?? 'Venezuela' };
  }
}