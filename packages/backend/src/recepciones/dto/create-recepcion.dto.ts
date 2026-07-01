import { IsInt, IsString, IsOptional, ValidateNested, IsArray, ArrayMinSize } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { CreateDetalleRecepcionDto } from './create-detalle-recepcion.dto'

export class CreateRecepcionDto {
  @ApiProperty()
  @IsInt()
  viajeId: number

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  responsableId?: number

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  observaciones?: string

  @ApiProperty({ type: [CreateDetalleRecepcionDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateDetalleRecepcionDto)
  detalles: CreateDetalleRecepcionDto[]
}
