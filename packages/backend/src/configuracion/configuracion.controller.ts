import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { ConfiguracionService } from './configuracion.service'
import { CreateConfiguracionDto } from './dto/create-configuracion.dto'
import { UpdateConfiguracionDto } from './dto/update-configuracion.dto'
import { Roles } from '../common/decorators/roles.decorator'

@ApiTags('Configuración')
@Controller('configuracion')
export class ConfiguracionController {
  constructor(private readonly configuracionService: ConfiguracionService) {}

  @Post()
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Crear configuración' })
  crear(@Body() dto: CreateConfiguracionDto) {
    return this.configuracionService.crear(dto)
  }

  @Get()
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO')
  @ApiOperation({ summary: 'Listar todas las configuraciones' })
  listar() {
    return this.configuracionService.listar()
  }

  @Get(':id')
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO')
  @ApiOperation({ summary: 'Obtener configuración por ID' })
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.configuracionService.obtener(id)
  }

  @Get('clave/:clave')
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO')
  @ApiOperation({ summary: 'Obtener configuración por clave' })
  obtenerPorClave(@Param('clave') clave: string) {
    return this.configuracionService.obtenerPorClave(clave)
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Actualizar configuración' })
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateConfiguracionDto) {
    return this.configuracionService.actualizar(id, dto)
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Eliminar configuración' })
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.configuracionService.eliminar(id)
  }
}
