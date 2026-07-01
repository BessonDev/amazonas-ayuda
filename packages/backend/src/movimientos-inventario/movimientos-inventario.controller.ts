import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { MovimientosInventarioService } from './movimientos-inventario.service'
import { CreateMovimientoDto } from './dto/create-movimiento.dto'
import { UpdateMovimientoDto } from './dto/update-movimiento.dto'
import { Roles } from '../common/decorators/roles.decorator'

@ApiTags('Movimientos de Inventario')
@Controller('movimientos')
export class MovimientosInventarioController {
  constructor(private readonly movimientosService: MovimientosInventarioService) {}

  @Post()
  @Roles('ADMINISTRADOR', 'COORDINADOR', 'LOGISTICA')
  @ApiOperation({ summary: 'Crear movimiento (calcula saldos automáticamente)' })
  crear(@Body() dto: CreateMovimientoDto) {
    return this.movimientosService.crear(dto)
  }

  @Get()
  @Roles('ADMINISTRADOR', 'COORDINADOR', 'LOGISTICA', 'VOLUNTARIO', 'RECEPTOR')
  @ApiOperation({ summary: 'Listar movimientos de inventario' })
  listar() {
    return this.movimientosService.listar()
  }

  @Get(':id')
  @Roles('ADMINISTRADOR', 'COORDINADOR', 'LOGISTICA', 'VOLUNTARIO', 'RECEPTOR')
  @ApiOperation({ summary: 'Obtener movimiento por ID' })
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.movimientosService.obtener(id)
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR', 'COORDINADOR', 'LOGISTICA')
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
