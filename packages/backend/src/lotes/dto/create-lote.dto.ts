import { IsString, IsInt, IsOptional, Min } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateLoteDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  cantidad: number

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  observaciones?: string

  @ApiProperty()
  @IsInt()
  campaniaId: number

  @ApiProperty()
  @IsInt()
  ubicacionId: number

  @ApiProperty()
  @IsInt()
  productoId: number

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  donanteId?: number
}
