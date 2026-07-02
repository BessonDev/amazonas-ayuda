import { IsInt, IsString, IsArray, IsOptional, ArrayMinSize, Min } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class TransferirLotesDto {
  @ApiProperty({ type: [Number] })
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  loteIds: number[]

  @ApiProperty()
  @IsInt()
  @Min(1)
  ubicacionDestinoId: number

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  observaciones?: string
}
