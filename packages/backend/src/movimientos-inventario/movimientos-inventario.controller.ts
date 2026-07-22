import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { MovimientosInventarioService } from './movimientos-inventario.service'
import { CreateMovimientoDto } from './dto/create-movimiento.dto'
import { UpdateMovimientoDto } from './dto/update-movimiento.dto'
import { Roles } from '../common/decorators/roles.decorator'
import { RolesGuard } from '../common/guards/roles.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { CiudadFilter } from '../common/decorators/ciudad-filter.decorator'
import { CiudadFilterGuard } from '../common/guards/ciudad-filter.guard'

@ApiTags('Movimientos de Inventario')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('movimientos')
export class MovimientosInventarioController {
  constructor(private readonly movimientosService: MovimientosInventarioService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard, CiudadFilterGuard)
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'OPERADOR_INVENTARIO')
  @ApiOperation({ summary: 'Crear movimiento (calcula saldos automáticamente)' })
  crear(
    @Body() dto: CreateMovimientoDto,
    @CurrentUser() user: any,
    @CiudadFilter() ciudadFilter: { ciudad: string; estado: string; pais: string } | null,
  ) {
    return this.movimientosService.crear(dto, user, ciudadFilter)
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard, CiudadFilterGuard)
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'OPERADOR_INVENTARIO', 'RESPONSABLE_DESTINO')
  @ApiOperation({ summary: 'Listar movimientos de inventario' })
  listar(@CiudadFilter() ciudadFilter: { ciudad: string; estado: string; pais: string } | null) {
    return this.movimientosService.listar(ciudadFilter)
  }

  @Get(':id')
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'OPERADOR_INVENTARIO', 'RESPONSABLE_DESTINO')
  @ApiOperation({ summary: 'Obtener movimiento por ID' })
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.movimientosService.obtener(id)
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO')
  @ApiOperation({ summary: 'Actualizar movimiento' })
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMovimientoDto) {
    return this.movimientosService.actualizar(id, dto)
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Eliminar movimiento' })
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.movimientosService.eliminar(id)
  }
}
