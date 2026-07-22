import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { LotesService } from './lotes.service'
import { CreateLoteDto } from './dto/create-lote.dto'
import { UpdateLoteDto } from './dto/update-lote.dto'
import { TransferirLotesDto } from './dto/transferir-lotes.dto'
import { Roles } from '../common/decorators/roles.decorator'
import { RolesGuard } from '../common/guards/roles.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { CiudadFilter } from '../common/decorators/ciudad-filter.decorator'
import { CiudadFilterGuard } from '../common/guards/ciudad-filter.guard'

@ApiTags('Lotes')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('lotes')
export class LotesController {
  constructor(private readonly lotesService: LotesService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard, CiudadFilterGuard)
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'OPERADOR_INVENTARIO')
  @ApiOperation({ summary: 'Crear lote (genera código y QR automáticamente)' })
  crear(
    @Body() dto: CreateLoteDto,
    @CurrentUser() user: any,
    @CiudadFilter() ciudadFilter: { ciudad: string; estado: string; pais: string } | null,
  ) {
    return this.lotesService.crear(dto, user, ciudadFilter)
  }

  @Post('transferir')
  @UseGuards(AuthGuard('jwt'), RolesGuard, CiudadFilterGuard)
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO')
  @ApiOperation({ summary: 'Transferir múltiples lotes entre ubicaciones' })
  transferir(
    @Body() dto: TransferirLotesDto,
    @CurrentUser() user: any,
    @CiudadFilter() ciudadFilter: { ciudad: string; estado: string; pais: string } | null,
  ) {
    return this.lotesService.transferir(dto, user, ciudadFilter)
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard, CiudadFilterGuard)
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'OPERADOR_INVENTARIO', 'RESPONSABLE_DESTINO')
  @ApiOperation({ summary: 'Listar todos los lotes (opcional: filtrar por ubicación)' })
  listar(
    @CiudadFilter() ciudadFilter: { ciudad: string; estado: string; pais: string } | null,
    @Query('ubicacionId') ubicacionId?: string,
  ) {
    return this.lotesService.listar(ciudadFilter, ubicacionId ? parseInt(ubicacionId) : undefined)
  }

  @Get(':id')
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'OPERADOR_INVENTARIO', 'RESPONSABLE_DESTINO')
  @ApiOperation({ summary: 'Obtener lote por ID' })
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.lotesService.obtener(id)
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'OPERADOR_INVENTARIO')
  @ApiOperation({ summary: 'Actualizar lote' })
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLoteDto, @CurrentUser() user: any) {
    return this.lotesService.actualizar(id, dto, user)
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'OPERADOR_INVENTARIO')
  @ApiOperation({ summary: 'Eliminar lote' })
  eliminar(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.lotesService.eliminar(id, user)
  }
}