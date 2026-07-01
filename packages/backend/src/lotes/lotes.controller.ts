import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { LotesService } from './lotes.service'
import { CreateLoteDto } from './dto/create-lote.dto'
import { UpdateLoteDto } from './dto/update-lote.dto'
import { Roles } from '../common/decorators/roles.decorator'

@ApiTags('Lotes')
@Controller('lotes')
export class LotesController {
  constructor(private readonly lotesService: LotesService) {}

  @Post()
  @Roles('ADMINISTRADOR', 'COORDINADOR', 'LOGISTICA')
  @ApiOperation({ summary: 'Crear lote (genera código y QR automáticamente)' })
  crear(@Body() dto: CreateLoteDto) {
    return this.lotesService.crear(dto)
  }

  @Get()
  @Roles('ADMINISTRADOR', 'COORDINADOR', 'LOGISTICA', 'VOLUNTARIO', 'RECEPTOR')
  @ApiOperation({ summary: 'Listar todos los lotes' })
  listar() {
    return this.lotesService.listar()
  }

  @Get(':id')
  @Roles('ADMINISTRADOR', 'COORDINADOR', 'LOGISTICA', 'VOLUNTARIO', 'RECEPTOR')
  @ApiOperation({ summary: 'Obtener lote por ID' })
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.lotesService.obtener(id)
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR', 'COORDINADOR', 'LOGISTICA')
  @ApiOperation({ summary: 'Actualizar lote' })
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLoteDto) {
    return this.lotesService.actualizar(id, dto)
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Eliminar lote' })
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.lotesService.eliminar(id)
  }
}
