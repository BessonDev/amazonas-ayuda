import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { CiudadService } from '../ciudad/ciudad.service';

@Injectable()
export class CiudadFilterGuard implements CanActivate {
  constructor(private ciudadService: CiudadService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Admin and Coordinador Logistico: no filter (access to all)
    if (['ADMINISTRADOR', 'COORDINADOR_LOGISTICO'].includes(user?.rol)) {
      request.ciudadFilter = null;
      return true;
    }

    // Operators: filter by their city from JWT
    const ciudad = this.ciudadService.getCiudadFromUser(user);
    if (!ciudad) {
      throw new ForbiddenException('Usuario sin ciudad asignada. Contacte al administrador.');
    }
    request.ciudadFilter = ciudad; // { ciudad, estado, pais }
    return true;
  }
}