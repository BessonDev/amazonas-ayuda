import { IsInt, Min } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateDetalleViajeDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  cantidad: number

  @ApiProperty()
  @IsInt()
  loteId: number
}
