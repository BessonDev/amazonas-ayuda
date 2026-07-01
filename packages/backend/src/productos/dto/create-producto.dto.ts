import { IsString, IsOptional, IsInt } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateProductoDto {
  @ApiProperty()
  @IsString()
  nombre: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  descripcion?: string

  @ApiProperty()
  @IsInt()
  categoriaId: number

  @ApiPropertyOptional({ default: 'UNIDAD' })
  @IsString()
  @IsOptional()
  unidad?: string
}
