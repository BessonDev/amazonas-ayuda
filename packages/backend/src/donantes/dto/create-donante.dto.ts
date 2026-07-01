import { IsString, IsOptional, IsEnum } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { TipoDonante } from '@donaciones/shared'

export class CreateDonanteDto {
  @ApiPropertyOptional({ enum: TipoDonante, default: 'ANONIMO' })
  @IsEnum(TipoDonante)
  @IsOptional()
  tipo?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  nombre?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  documento?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  email?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  telefono?: string
}
