import { Controller, Get, Query, Res, DefaultValuePipe, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger'
import { Response } from 'express'
import { ReportesService } from './reportes.service'
import { Roles } from '../common/decorators/roles.decorator'
import { RolesGuard } from '../common/guards/roles.guard'

@ApiTags('Reportes')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('inventario')
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO')
  @ApiOperation({ summary: 'Generar reporte de inventario (PDF o Excel)' })
  @ApiQuery({ name: 'formato', required: false, enum: ['pdf', 'excel'] })
  async inventario(
    @Query('formato', new DefaultValuePipe('pdf')) formato: string,
    @Res() res: Response,
  ) {
    const fmt = formato === 'excel' ? 'excel' : 'pdf'
    return this.reportesService.generarInventario(fmt, res)
  }

  @Get('donaciones')
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO')
  @ApiOperation({ summary: 'Generar reporte de donaciones (PDF o Excel)' })
  @ApiQuery({ name: 'formato', required: false, enum: ['pdf', 'excel'] })
  async donaciones(
    @Query('formato', new DefaultValuePipe('pdf')) formato: string,
    @Res() res: Response,
  ) {
    const fmt = formato === 'excel' ? 'excel' : 'pdf'
    return this.reportesService.generarDonaciones(fmt, res)
  }

  @Get('viajes')
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO')
  @ApiOperation({ summary: 'Generar reporte de viajes (PDF o Excel)' })
  @ApiQuery({ name: 'formato', required: false, enum: ['pdf', 'excel'] })
  async viajes(
    @Query('formato', new DefaultValuePipe('pdf')) formato: string,
    @Res() res: Response,
  ) {
    const fmt = formato === 'excel' ? 'excel' : 'pdf'
    return this.reportesService.generarViajes(fmt, res)
  }
}
