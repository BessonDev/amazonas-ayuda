import {
  Controller, Get, Post, Patch, Param, Body,
  ParseIntPipe, UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { DonantesService } from './donantes.service'
import { CreateDonanteDto } from './dto/create-donante.dto'
import { UpdateDonanteDto } from './dto/update-donante.dto'
import { Roles } from '../common/decorators/roles.decorator'
import { RolesGuard } from '../common/guards/roles.guard'

@ApiTags('Donantes')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('donantes')
export class DonantesController {
  constructor(private donantesService: DonantesService) {}

  @Get()
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'OPERADOR_INVENTARIO')
  @ApiOperation({ summary: 'Listar donantes' })
  listar() {
    return this.donantesService.listar()
  }

  @Get(':id')
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'OPERADOR_INVENTARIO')
  @ApiOperation({ summary: 'Obtener donante por ID' })
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.donantesService.obtener(id)
  }

  @Post()
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO')
  @ApiOperation({ summary: 'Crear donante' })
  crear(@Body() dto: CreateDonanteDto) {
    return this.donantesService.crear(dto)
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO')
  @ApiOperation({ summary: 'Actualizar donante' })
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDonanteDto) {
    return this.donantesService.actualizar(id, dto)
  }
}
