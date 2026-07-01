import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { SolicitudesService } from './solicitudes.service'
import { CreateSolicitudDto } from './dto/create-solicitud.dto'
import { UpdateSolicitudDto } from './dto/update-solicitud.dto'
import { Roles } from '../common/decorators/roles.decorator'

@ApiTags('Solicitudes')
@Controller('solicitudes')
export class SolicitudesController {
  constructor(private readonly solicitudesService: SolicitudesService) {}

  @Post()
  @Roles('ADMINISTRADOR', 'COORDINADOR', 'RECEPTOR')
  @ApiOperation({ summary: 'Crear solicitud con detalles' })
  crear(@Body() dto: CreateSolicitudDto) {
    return this.solicitudesService.crear(dto)
  }

  @Get()
  @Roles('ADMINISTRADOR', 'COORDINADOR', 'LOGISTICA', 'VOLUNTARIO', 'RECEPTOR')
  @ApiOperation({ summary: 'Listar todas las solicitudes' })
  listar() {
    return this.solicitudesService.listar()
  }

  @Get(':id')
  @Roles('ADMINISTRADOR', 'COORDINADOR', 'LOGISTICA', 'VOLUNTARIO', 'RECEPTOR')
  @ApiOperation({ summary: 'Obtener solicitud por ID' })
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudesService.obtener(id)
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR', 'COORDINADOR', 'RECEPTOR')
  @ApiOperation({ summary: 'Actualizar solicitud' })
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSolicitudDto) {
    return this.solicitudesService.actualizar(id, dto)
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Eliminar solicitud' })
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudesService.eliminar(id)
  }
}
