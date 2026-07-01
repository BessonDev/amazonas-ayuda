import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { RecepcionesService } from './recepciones.service'
import { CreateRecepcionDto } from './dto/create-recepcion.dto'
import { UpdateRecepcionDto } from './dto/update-recepcion.dto'
import { Roles } from '../common/decorators/roles.decorator'

@ApiTags('Recepciones')
@Controller('recepciones')
export class RecepcionesController {
  constructor(private readonly recepcionesService: RecepcionesService) {}

  @Post()
  @Roles('ADMINISTRADOR', 'COORDINADOR', 'LOGISTICA')
  @ApiOperation({ summary: 'Crear recepción (genera movimiento de inventario automáticamente)' })
  crear(@Body() dto: CreateRecepcionDto) {
    return this.recepcionesService.crear(dto)
  }

  @Get()
  @Roles('ADMINISTRADOR', 'COORDINADOR', 'LOGISTICA', 'VOLUNTARIO', 'RECEPTOR')
  @ApiOperation({ summary: 'Listar todas las recepciones' })
  listar() {
    return this.recepcionesService.listar()
  }

  @Get(':id')
  @Roles('ADMINISTRADOR', 'COORDINADOR', 'LOGISTICA', 'VOLUNTARIO', 'RECEPTOR')
  @ApiOperation({ summary: 'Obtener recepción por ID' })
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.recepcionesService.obtener(id)
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR', 'COORDINADOR', 'LOGISTICA')
  @ApiOperation({ summary: 'Actualizar recepción' })
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRecepcionDto) {
    return this.recepcionesService.actualizar(id, dto)
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Eliminar recepción' })
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.recepcionesService.eliminar(id)
  }
}
