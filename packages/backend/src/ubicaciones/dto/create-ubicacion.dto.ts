import { IsString, IsOptional, IsInt } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateUbicacionDto {
  @ApiProperty()
  @IsString()
  nombre: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  direccion?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  ciudad?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  estado?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  pais?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  contacto?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  telefono?: string

  @ApiProperty()
  @IsInt()
  tipoId: number

  @ApiProperty()
  @IsInt()
  campaniaId: number
}
