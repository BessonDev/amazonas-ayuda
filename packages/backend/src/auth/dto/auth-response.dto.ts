import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class AuthResponseDto {
  @ApiProperty({ type: Number })
  id: number

  @ApiProperty({ type: String })
  nombre: string

  @ApiProperty({ type: String })
  email: string

  @ApiProperty({ type: String })
  rol: string

  @ApiProperty({ type: String })
  accessToken: string

  @ApiPropertyOptional({ type: Number })
  ubicacionId?: number
}
