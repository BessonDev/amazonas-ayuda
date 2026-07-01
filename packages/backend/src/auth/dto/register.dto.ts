import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class RegisterDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @MinLength(2)
  nombre: string

  @ApiProperty({ example: 'juan@ejemplo.com' })
  @IsEmail()
  email: string

  @ApiProperty({ example: 'miPassword123' })
  @IsString()
  @MinLength(6)
  password: string

  @ApiPropertyOptional({ example: '+584141234567' })
  @IsString()
  @IsOptional()
  telefono?: string
}
