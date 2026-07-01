import { IsString, IsOptional, IsDateString } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { EstadoCampania } from '@donaciones/shared'

export class CreateCampaniaDto {
  @ApiProperty()
  @IsString()
  nombre: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  descripcion?: string

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  fechaInicio?: string

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  fechaFin?: string

  @ApiPropertyOptional({ enum: EstadoCampania, default: 'PLANIFICADA' })
  @IsString()
  @IsOptional()
  estado?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  imagenUrl?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  objetivo?: string
}
