import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { PublicoService } from './publico.service'

@ApiTags('Público')
@Controller('publico')
export class PublicoController {
  constructor(private publicoService: PublicoService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Estadísticas públicas del sistema' })
  stats() {
    return this.publicoService.stats()
  }

  @Get('solicitudes')
  @ApiOperation({ summary: 'Solicitudes activas con progreso de recolección' })
  solicitudes() {
    return this.publicoService.solicitudes()
  }

  @Get('viajes')
  @ApiOperation({ summary: 'Viajes activos y programados' })
  viajes() {
    return this.publicoService.viajes()
  }

  @Get('lotes/:codigo')
  @ApiOperation({ summary: 'Buscar lote por código (público)' })
  buscarLote(@Param('codigo') codigo: string) {
    return this.publicoService.buscarLote(codigo)
  }

  @Get('recepciones/fotos')
  @ApiOperation({ summary: 'Fotos de recepciones para galería pública' })
  fotosRecepciones(@Query('limit') limit?: string) {
    return this.publicoService.fotosRecepciones(limit ? parseInt(limit) : 15)
  }
}
