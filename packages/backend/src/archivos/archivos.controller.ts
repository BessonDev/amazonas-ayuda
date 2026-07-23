import { Controller, Get, Post, Param, Delete, Query, Body, UseInterceptors, UploadedFile, ParseIntPipe, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger'
import { ArchivosService } from './archivos.service'
import { Roles } from '../common/decorators/roles.decorator'
import { RolesGuard } from '../common/guards/roles.guard'

@ApiTags('Archivos')
@Controller('archivos')
export class ArchivosController {
  constructor(private readonly archivosService: ArchivosService) {}

  @Post('upload')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'RESPONSABLE_DESTINO')
  @ApiOperation({ summary: 'Subir archivo' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        archivo: { type: 'string', format: 'binary' },
        nombre: { type: 'string' },
        entidadTipo: { type: 'string' },
        entidadId: { type: 'integer' },
        campaniaId: { type: 'integer' },
        viajeId: { type: 'integer' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('archivo'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    return this.archivosService.crear(file, {
      nombre: body.nombre,
      entidadTipo: body.entidadTipo,
      entidadId: parseInt(body.entidadId),
      campaniaId: body.campaniaId ? parseInt(body.campaniaId) : undefined,
      viajeId: body.viajeId ? parseInt(body.viajeId) : undefined,
    })
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'OPERADOR_INVENTARIO', 'RESPONSABLE_DESTINO')
  @ApiOperation({ summary: 'Listar archivos (opcional: filtrar por entidad)' })
  listar(
    @Query('entidadTipo') entidadTipo?: string,
    @Query('entidadId') entidadId?: string,
  ) {
    return this.archivosService.listar(entidadTipo, entidadId ? parseInt(entidadId) : undefined)
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'OPERADOR_INVENTARIO', 'RESPONSABLE_DESTINO')
  @ApiOperation({ summary: 'Obtener archivo por ID' })
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.archivosService.obtener(id)
  }

  @Get(':id/descargar')
  @ApiOperation({ summary: 'Descargar archivo (público)' })
  descargar(@Param('id', ParseIntPipe) id: number) {
    return this.archivosService.descargar(id)
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Eliminar archivo' })
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.archivosService.eliminar(id)
  }
}
