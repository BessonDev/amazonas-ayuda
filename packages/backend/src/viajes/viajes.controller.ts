import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger'
import { ViajesService } from './viajes.service'
import { CreateViajeDto } from './dto/create-viaje.dto'
import { UpdateViajeDto } from './dto/update-viaje.dto'
import { CambiarEstadoViajeDto } from './dto/cambiar-estado-viaje.dto'
import { RecibirViajeDto } from './dto/recibir-viaje.dto'
import { Roles } from '../common/decorators/roles.decorator'
import { RolesGuard } from '../common/guards/roles.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@ApiTags('Viajes')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('viajes')
export class ViajesController {
  constructor(private readonly viajesService: ViajesService) {}

  @Post()
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO')
  @ApiOperation({ summary: 'Crear viaje (genera código automáticamente)' })
  crear(@Body() dto: CreateViajeDto) {
    return this.viajesService.crear(dto)
  }

  @Get('lotes-disponibles')
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'OPERADOR_INVENTARIO', 'RESPONSABLE_DESTINO')
  @ApiOperation({ summary: 'Lotes disponibles en un origen, consolidados por producto (FIFO)' })
  @ApiQuery({ name: 'origenId', type: Number, required: true })
  lotesDisponibles(@Query('origenId', ParseIntPipe) origenId: number) {
    return this.viajesService.lotesDisponibles(origenId)
  }

  @Get('recepciones')
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'OPERADOR_INVENTARIO', 'RESPONSABLE_DESTINO')
  @ApiOperation({ summary: 'Listar todas las recepciones (para referenciar imágenes)' })
  listarRecepciones() {
    return this.viajesService.listarRecepciones()
  }

  @Get()
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'OPERADOR_INVENTARIO', 'RESPONSABLE_DESTINO')
  @ApiOperation({ summary: 'Listar todos los viajes' })
  @ApiQuery({ name: 'destinoId', type: Number, required: false, description: 'Filtrar por destino (se usa internamente para RESPONSABLE_DESTINO)' })
  listar(@Query('destinoId') destinoId?: number, @CurrentUser() user?: any) {
    // Auto-filtrar para RESPONSABLE_DESTINO
    if (user?.rol === 'RESPONSABLE_DESTINO' && user.ubicacionId) {
      return this.viajesService.listar(user.ubicacionId)
    }
    return this.viajesService.listar(destinoId)
  }

  @Get(':id')
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'OPERADOR_INVENTARIO', 'RESPONSABLE_DESTINO')
  @ApiOperation({ summary: 'Obtener viaje por ID' })
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.viajesService.obtener(id)
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO')
  @ApiOperation({ summary: 'Actualizar viaje' })
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateViajeDto) {
    return this.viajesService.actualizar(id, dto)
  }

  @Post(':id/recibir')
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'RESPONSABLE_DESTINO')
  @ApiOperation({ summary: 'Recibir viaje (determina automáticamente COMPLETADO o RECEPCION_PARCIAL)' })
  recibir(@Param('id', ParseIntPipe) id: number, @Body() dto: RecibirViajeDto, @CurrentUser() user: any) {
    return this.viajesService.recibir(id, dto.detallesRecepcion, {
      observaciones: dto.observaciones,
      user,
    })
  }

  @Patch(':id/estado')
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO')
  @ApiOperation({ summary: 'Cambiar estado de viaje con transiciones automáticas' })
  cambiarEstado(@Param('id', ParseIntPipe) id: number, @Body() dto: CambiarEstadoViajeDto) {
    return this.viajesService.cambiarEstado(id, dto.estado, {
      observaciones: dto.observaciones,
      responsableId: dto.responsableId,
      detallesRecepcion: dto.detallesRecepcion,
    })
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Eliminar viaje' })
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.viajesService.eliminar(id)
  }
}
