import { IsOptional, IsString, IsDateString, IsEnum } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export enum FormatoReporte {
  PDF = 'pdf',
  EXCEL = 'excel',
}

export class ReporteFiltrosDto {
  @ApiPropertyOptional({ description: 'Formato de salida: pdf o excel' })
  @IsOptional()
  @IsEnum(FormatoReporte)
  formato?: FormatoReporte

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  desde?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  hasta?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  campaniaId?: string
}
