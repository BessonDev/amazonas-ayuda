import {
  Controller, Get, Post, Patch, Delete, Param, Body,
  ParseIntPipe, UseGuards, Query,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { CampaniasService } from './campanias.service'
import { CreateCampaniaDto } from './dto/create-campania.dto'
import { UpdateCampaniaDto } from './dto/update-campania.dto'
import { Roles } from '../common/decorators/roles.decorator'
import { RolesGuard } from '../common/guards/roles.guard'

@ApiTags('Campañas')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('campanias')
export class CampaniasController {
  constructor(private campaniasService: CampaniasService) {}

  @Get()
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'OPERADOR_INVENTARIO', 'RESPONSABLE_DESTINO')
  @ApiOperation({ summary: 'Listar campañas' })
  @ApiQuery({ name: 'estado', required: false, enum: ['PLANIFICADA', 'ACTIVA', 'CERRADA', 'CANCELADA'] })
  listar(@Query('estado') estado?: string) {
    return this.campaniasService.listar(estado)
  }

  @Get(':id')
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'OPERADOR_INVENTARIO')
  @ApiOperation({ summary: 'Obtener campaña por ID' })
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.campaniasService.obtener(id)
  }

  @Post()
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO')
  @ApiOperation({ summary: 'Crear campaña' })
  crear(@Body() dto: CreateCampaniaDto) {
    return this.campaniasService.crear(dto)
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO')
  @ApiOperation({ summary: 'Actualizar campaña' })
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCampaniaDto) {
    return this.campaniasService.actualizar(id, dto)
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Eliminar campaña' })
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.campaniasService.eliminar(id)
  }
}
