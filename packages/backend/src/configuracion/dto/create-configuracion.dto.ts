import { IsString, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateConfiguracionDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  clave: string

  @ApiProperty()
  @IsString()
  valor: string
}
