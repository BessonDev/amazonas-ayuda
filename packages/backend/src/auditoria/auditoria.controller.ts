import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { AuditoriaService } from './auditoria.service'
import { ConsultaAuditoriaDto } from './dto/consulta-auditoria.dto'
import { Roles } from '../common/decorators/roles.decorator'
import { RolesGuard } from '../common/guards/roles.guard'

@ApiTags('Auditoría')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get()
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Listar registros de auditoría con filtros' })
  listar(@Query() filtros: ConsultaAuditoriaDto) {
    return this.auditoriaService.listar(filtros)
  }

  @Get(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Obtener registro de auditoría por ID' })
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.auditoriaService.obtener(id)
  }
}
