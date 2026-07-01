import { IsString, IsInt, IsOptional, IsEnum, ValidateNested, IsArray, ArrayMinSize } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { PrioridadSolicitud, EstadoSolicitud } from '@prisma/client'
import { CreateDetalleSolicitudDto } from './create-detalle-solicitud.dto'

export class CreateSolicitudDto {
  @ApiProperty()
  @IsString()
  titulo: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  descripcion?: string

  @ApiPropertyOptional({ enum: PrioridadSolicitud, default: 'MEDIA' })
  @IsEnum(PrioridadSolicitud)
  @IsOptional()
  prioridad?: PrioridadSolicitud

  @ApiPropertyOptional({ enum: EstadoSolicitud, default: 'ABIERTA' })
  @IsEnum(EstadoSolicitud)
  @IsOptional()
  estado?: EstadoSolicitud

  @ApiProperty()
  @IsInt()
  campaniaId: number

  @ApiProperty()
  @IsInt()
  ubicacionId: number

  @ApiProperty({ type: [CreateDetalleSolicitudDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateDetalleSolicitudDto)
  detalles: CreateDetalleSolicitudDto[]
}
