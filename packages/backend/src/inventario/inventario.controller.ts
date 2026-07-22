import { Controller, Get, Query, ParseIntPipe, Res, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { Response } from 'express'
import { InventarioService } from './inventario.service'
import { Roles } from '../common/decorators/roles.decorator'
import { RolesGuard } from '../common/guards/roles.guard'
import { CiudadFilter } from '../common/decorators/ciudad-filter.decorator'
import { CiudadFilterGuard } from '../common/guards/ciudad-filter.guard'

@ApiTags('Inventario')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('inventario')
export class InventarioController {
  constructor(private inventarioService: InventarioService) {}

@Get()
@UseGuards(AuthGuard('jwt'), RolesGuard, CiudadFilterGuard)
@Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'OPERADOR_INVENTARIO', 'RESPONSABLE_DESTINO')
@ApiOperation({ summary: 'Resumen de inventario disponible agrupado por producto y ubicación' })
listar(
  @CiudadFilter() ciudadFilter: { ciudad: string; estado: string; pais: string } | null,
  @Query('ubicacionId', new ParseIntPipe({ optional: true })) ubicacionId?: number,
) {
  return this.inventarioService.listar(ciudadFilter, ubicacionId)
}

  @Get('pdf')
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO')
  @ApiOperation({ summary: 'Descargar inventario en PDF' })
  async pdf(
    @Res() res: Response,
    @Query('ubicacionId', new ParseIntPipe({ optional: true })) ubicacionId?: number,
  ) {
    return this.inventarioService.generarPDF(res, ubicacionId)
  }
}
