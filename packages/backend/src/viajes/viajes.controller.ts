import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { ViajesService } from './viajes.service'
import { CreateViajeDto } from './dto/create-viaje.dto'
import { UpdateViajeDto } from './dto/update-viaje.dto'
import { Roles } from '../common/decorators/roles.decorator'

@ApiTags('Viajes')
@Controller('viajes')
export class ViajesController {
  constructor(private readonly viajesService: ViajesService) {}

  @Post()
  @Roles('ADMINISTRADOR', 'COORDINADOR', 'LOGISTICA')
  @ApiOperation({ summary: 'Crear viaje (genera código automáticamente)' })
  crear(@Body() dto: CreateViajeDto) {
    return this.viajesService.crear(dto)
  }

  @Get()
  @Roles('ADMINISTRADOR', 'COORDINADOR', 'LOGISTICA', 'VOLUNTARIO', 'RECEPTOR')
  @ApiOperation({ summary: 'Listar todos los viajes' })
  listar() {
    return this.viajesService.listar()
  }

  @Get(':id')
  @Roles('ADMINISTRADOR', 'COORDINADOR', 'LOGISTICA', 'VOLUNTARIO', 'RECEPTOR')
  @ApiOperation({ summary: 'Obtener viaje por ID' })
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.viajesService.obtener(id)
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR', 'COORDINADOR', 'LOGISTICA')
  @ApiOperation({ summary: 'Actualizar viaje' })
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateViajeDto) {
    return this.viajesService.actualizar(id, dto)
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Eliminar viaje' })
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.viajesService.eliminar(id)
  }
}
