import {
  Controller, Get, Post, Patch, Param, Body,
  ParseIntPipe, UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { UbicacionesService } from './ubicaciones.service'
import { CreateUbicacionDto } from './dto/create-ubicacion.dto'
import { UpdateUbicacionDto } from './dto/update-ubicacion.dto'
import { Roles } from '../common/decorators/roles.decorator'
import { RolesGuard } from '../common/guards/roles.guard'

@ApiTags('Ubicaciones')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('ubicaciones')
export class UbicacionesController {
  constructor(private ubicacionesService: UbicacionesService) {}

  @Get()
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'OPERADOR_INVENTARIO')
  @ApiOperation({ summary: 'Listar ubicaciones' })
  listar() {
    return this.ubicacionesService.listar()
  }

  @Get(':id')
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'OPERADOR_INVENTARIO')
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
}
