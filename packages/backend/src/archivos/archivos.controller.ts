import { Controller, Get, Post, Param, Delete, Query, Body, UseInterceptors, UploadedFile, ParseIntPipe } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger'
import { ArchivosService } from './archivos.service'
import { Roles } from '../common/decorators/roles.decorator'

@ApiTags('Archivos')
@Controller('archivos')
export class ArchivosController {
  constructor(private readonly archivosService: ArchivosService) {}

  @Post('upload')
  @Roles('ADMINISTRADOR', 'COORDINADOR', 'LOGISTICA', 'RECEPTOR')
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
  @Roles('ADMINISTRADOR', 'COORDINADOR', 'LOGISTICA', 'VOLUNTARIO', 'RECEPTOR')
  @ApiOperation({ summary: 'Listar archivos (opcional: filtrar por entidad)' })
  listar(
    @Query('entidadTipo') entidadTipo?: string,
    @Query('entidadId') entidadId?: string,
  ) {
    return this.archivosService.listar(entidadTipo, entidadId ? parseInt(entidadId) : undefined)
  }

  @Get(':id')
  @Roles('ADMINISTRADOR', 'COORDINADOR', 'LOGISTICA', 'VOLUNTARIO', 'RECEPTOR')
  @ApiOperation({ summary: 'Obtener archivo por ID' })
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.archivosService.obtener(id)
  }

  @Get(':id/descargar')
  @Roles('ADMINISTRADOR', 'COORDINADOR', 'LOGISTICA', 'VOLUNTARIO', 'RECEPTOR')
  @ApiOperation({ summary: 'Descargar archivo' })
  descargar(@Param('id', ParseIntPipe) id: number) {
    return this.archivosService.descargar(id)
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Eliminar archivo' })
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.archivosService.eliminar(id)
  }
}
