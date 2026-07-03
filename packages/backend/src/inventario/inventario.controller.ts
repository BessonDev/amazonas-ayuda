import { Controller, Get, Query, ParseIntPipe, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { InventarioService } from './inventario.service'
import { Roles } from '../common/decorators/roles.decorator'
import { RolesGuard } from '../common/guards/roles.guard'

@ApiTags('Inventario')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('inventario')
export class InventarioController {
  constructor(private inventarioService: InventarioService) {}

  @Get()
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'OPERADOR_INVENTARIO', 'RESPONSABLE_DESTINO')
  @ApiOperation({ summary: 'Resumen de inventario disponible agrupado por producto y ubicación' })
  listar(
    @Query('ubicacionId', new ParseIntPipe({ optional: true })) ubicacionId?: number,
  ) {
    return this.inventarioService.listar(ubicacionId)
  }
}
