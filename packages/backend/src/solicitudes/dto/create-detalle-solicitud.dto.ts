import { IsInt, IsString, IsOptional, Min } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateDetalleSolicitudDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  meta: number

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  descripcion?: string

  @ApiProperty()
  @IsInt()
  productoId: number
}
