import {
  Controller, Get, Post, Patch, Delete, Param, Body,
  ParseIntPipe, UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { UbicacionesService } from './ubicaciones.service'
import { CreateUbicacionDto } from './dto/create-ubicacion.dto'
import { UpdateUbicacionDto } from './dto/update-ubicacion.dto'
import { Roles } from '../common/decorators/roles.decorator'
import { RolesGuard } from '../common/guards/roles.guard'
import { CiudadFilter } from '../common/decorators/ciudad-filter.decorator'
import { CiudadFilterGuard } from '../common/guards/ciudad-filter.guard'

@ApiTags('Ubicaciones')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('ubicaciones')
export class UbicacionesController {
  constructor(private ubicacionesService: UbicacionesService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard, CiudadFilterGuard)
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'OPERADOR_INVENTARIO', 'RESPONSABLE_DESTINO')
  @ApiOperation({ summary: 'Listar ubicaciones (filtradas por ciudad para operadores)' })
  listar(@CiudadFilter() ciudadFilter: { ciudad: string; estado: string; pais: string } | null) {
    return this.ubicacionesService.listar(ciudadFilter)
  }

  @Get('tipos')
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'OPERADOR_INVENTARIO')
  @ApiOperation({ summary: 'Listar tipos de ubicación' })
  listarTipos() {
    return this.ubicacionesService.listarTipos()
  }

  @Get(':id')
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'OPERADOR_INVENTARIO', 'RESPONSABLE_DESTINO')
  @ApiOperation({ summary: 'Obtener ubicación por ID' })
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.ubicacionesService.obtener(id)
  }

  @Post()
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO')
  @ApiOperation({ summary: 'Crear ubicación' })
  crear(@Body() dto: CreateUbicacionDto) {
    return this.ubicacionesService.crear(dto)
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO')
  @ApiOperation({ summary: 'Actualizar ubicación' })
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUbicacionDto) {
    return this.ubicacionesService.actualizar(id, dto)
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Eliminar ubicación' })
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.ubicacionesService.eliminar(id)
  }
}
