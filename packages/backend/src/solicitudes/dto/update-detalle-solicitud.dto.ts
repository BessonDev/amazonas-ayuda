import { IsInt, Min } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateDetalleSolicitudDto {
  @ApiProperty()
  @IsInt()
  @Min(0)
  recibido: number
}
