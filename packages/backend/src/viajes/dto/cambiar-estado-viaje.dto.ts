import { IsEnum, IsString, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { EstadoViaje } from '@prisma/client'

export class CambiarEstadoViajeDto {
  @ApiProperty({ enum: EstadoViaje })
  @IsEnum(EstadoViaje)
  estado: EstadoViaje

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  observaciones?: string
}