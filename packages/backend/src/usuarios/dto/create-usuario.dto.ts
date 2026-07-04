import { IsEmail, IsString, MinLength, IsOptional, IsInt } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateUsuarioDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  nombre: string

  @ApiProperty()
  @IsEmail()
  email: string

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  telefono?: string

  @ApiProperty()
  @IsInt()
  rolId: number

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  ubicacionId?: number
}
