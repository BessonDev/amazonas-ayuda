import { ApiProperty } from '@nestjs/swagger'

export class AuthResponseDto {
  @ApiProperty()
  id: number

  @ApiProperty()
  nombre: string

  @ApiProperty()
  email: string

  @ApiProperty()
  rol: string

  @ApiProperty()
  accessToken: string
}
