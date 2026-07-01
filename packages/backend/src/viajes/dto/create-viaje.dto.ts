import { IsString, IsInt, IsOptional, IsEnum, Min, ValidateNested, IsArray, ArrayMinSize } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { EstadoViaje } from '@prisma/client'
import { CreateDetalleViajeDto } from './create-detalle-viaje.dto'

export class CreateViajeDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  nombreResponsable?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  vehiculo?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  conductor?: string

  @ApiPropertyOptional()
  @IsOptional()
  fechaSalida?: string

  @ApiPropertyOptional()
  @IsOptional()
  fechaEstimada?: string

  @ApiPropertyOptional()
  @IsOptional()
  fechaLlegada?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  observaciones?: string

  @ApiPropertyOptional({ enum: EstadoViaje })
  @IsEnum(EstadoViaje)
  @IsOptional()
  estado?: EstadoViaje

  @ApiProperty()
  @IsInt()
  campaniaId: number

  @ApiProperty()
  @IsInt()
  origenId: number

  @ApiProperty()
  @IsInt()
  destinoId: number

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  responsableId?: number

  @ApiProperty({ type: [CreateDetalleViajeDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateDetalleViajeDto)
  detalles: CreateDetalleViajeDto[]
}
