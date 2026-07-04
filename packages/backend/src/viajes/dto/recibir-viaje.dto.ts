import { IsString, IsOptional, IsArray, ValidateNested, ArrayMinSize } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { DetalleRecepcionDto } from './cambiar-estado-viaje.dto'

export class RecibirViajeDto {
  @ApiProperty({ type: [DetalleRecepcionDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => DetalleRecepcionDto)
  detallesRecepcion: DetalleRecepcionDto[]

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  observaciones?: string

  @ApiPropertyOptional({ description: 'URL de la foto de recepción' })
  @IsString()
  @IsOptional()
  fotoRecepcionUrl?: string
}
