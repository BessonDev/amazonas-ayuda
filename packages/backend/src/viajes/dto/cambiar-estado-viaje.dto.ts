import { IsEnum, IsString, IsOptional, IsInt, Min, IsArray, ValidateNested, ArrayMinSize } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { EstadoViaje } from '@prisma/client'

export class DetalleRecepcionDto {
  @ApiProperty()
  @IsInt()
  loteId: number

  @ApiProperty()
  @IsInt()
  @Min(0)
  cantidadRecibida: number

  @ApiPropertyOptional({ default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  cantidadDanada?: number

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  observaciones?: string
}

export class CambiarEstadoViajeDto {
  @ApiProperty({ enum: EstadoViaje })
  @IsEnum(EstadoViaje)
  estado: EstadoViaje

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  responsableId?: number

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  observaciones?: string

  @ApiPropertyOptional({ type: [DetalleRecepcionDto] })
  @IsArray()
  @IsOptional()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => DetalleRecepcionDto)
  detallesRecepcion?: DetalleRecepcionDto[]
}