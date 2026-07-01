import { IsInt, IsString, IsOptional, Min, MinLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateDetalleRecepcionDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  cantidadRecibida: number

  @ApiPropertyOptional({ default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  cantidadFaltante?: number

  @ApiPropertyOptional({ default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  cantidadDanada?: number

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  observaciones?: string

  @ApiProperty()
  @IsInt()
  loteId: number
}
