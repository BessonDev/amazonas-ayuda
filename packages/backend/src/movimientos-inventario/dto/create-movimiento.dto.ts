import { IsString, IsInt, IsOptional, Min, IsEnum } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { TipoMovimiento } from '@prisma/client'

export class CreateMovimientoDto {
  @ApiProperty({ enum: TipoMovimiento })
  @IsEnum(TipoMovimiento)
  tipo: TipoMovimiento

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
  loteId: number

  @ApiProperty()
  @IsInt()
  ubicacionId: number

  @ApiProperty()
  @IsInt()
  campaniaId: number
}
