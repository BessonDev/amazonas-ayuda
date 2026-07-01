import { IsString, IsInt, IsOptional, Min, IsEnum } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { TipoMovimiento } from '@prisma/client'

export class CreateMovimientoDto {
  @ApiProperty({ enum: ['ENTRADA', 'RESERVA', 'TRANSFERENCIA', 'ENVIO', 'RECEPCION', 'AJUSTE', 'DISTRIBUCION', 'CONSUMO'] })
  @IsEnum(['ENTRADA', 'RESERVA', 'TRANSFERENCIA', 'ENVIO', 'RECEPCION', 'AJUSTE', 'DISTRIBUCION', 'CONSUMO'])
  tipo: string

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
