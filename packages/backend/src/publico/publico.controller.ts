import { Controller, Get, Param } from '@nestjs/common'
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

  @Get('lotes/:codigo')
  @ApiOperation({ summary: 'Buscar lote por código (público)' })
  buscarLote(@Param('codigo') codigo: string) {
    return this.publicoService.buscarLote(codigo)
  }
}
