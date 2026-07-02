import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { LotesService } from './lotes.service'
import { CreateLoteDto } from './dto/create-lote.dto'
import { UpdateLoteDto } from './dto/update-lote.dto'
import { TransferirLotesDto } from './dto/transferir-lotes.dto'
import { Roles } from '../common/decorators/roles.decorator'
import { RolesGuard } from '../common/guards/roles.guard'

@ApiTags('Lotes')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('lotes')
export class LotesController {
  constructor(private readonly lotesService: LotesService) {}

  @Post()
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO')
  @ApiOperation({ summary: 'Crear lote (genera código y QR automáticamente)' })
  crear(@Body() dto: CreateLoteDto) {
    return this.lotesService.crear(dto)
  }

  @Post('transferir')
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO')
  @ApiOperation({ summary: 'Transferir múltiples lotes entre ubicaciones' })
  transferir(@Body() dto: TransferirLotesDto) {
    return this.lotesService.transferir(dto)
  }

  @Get()
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'OPERADOR_INVENTARIO', 'RESPONSABLE_DESTINO')
  @ApiOperation({ summary: 'Listar todos los lotes' })
  listar() {
    return this.lotesService.listar()
  }

  @Get(':id')
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'OPERADOR_INVENTARIO', 'RESPONSABLE_DESTINO')
  @ApiOperation({ summary: 'Obtener lote por ID' })
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.lotesService.obtener(id)
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO')
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
