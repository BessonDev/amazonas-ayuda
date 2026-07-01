import { IsOptional, IsString, IsInt, IsDateString } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class ConsultaAuditoriaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  entidadTipo?: string

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  entidadId?: number

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  usuarioId?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accion?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  desde?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  hasta?: string
}
