import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { UsuariosService } from './usuarios.service'
import { CreateUsuarioDto } from './dto/create-usuario.dto'
import { UpdateUsuarioDto } from './dto/update-usuario.dto'
import { Roles } from '../common/decorators/roles.decorator'
import { RolesGuard } from '../common/guards/roles.guard'

@ApiTags('Usuarios')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private usuariosService: UsuariosService) {}

  @Get()
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Listar todos los usuarios' })
  listar() {
    return this.usuariosService.listar()
  }

  @Get(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.obtener(id)
  }

  @Post()
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Crear usuario' })
  crear(@Body() dto: CreateUsuarioDto) {
    return this.usuariosService.crear(dto)
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Actualizar usuario' })
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUsuarioDto) {
    return this.usuariosService.actualizar(id, dto)
  }

  @Patch(':id/desactivar')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Desactivar usuario' })
  desactivar(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.desactivar(id)
  }
}
