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

  @ApiProperty()
  @IsString()
  ciudad: string

  @ApiProperty()
  @IsString()
  estado: string

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
