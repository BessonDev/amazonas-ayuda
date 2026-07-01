import { PartialType } from '@nestjs/swagger'
import { CreateDonanteDto } from './create-donante.dto'

export class UpdateDonanteDto extends PartialType(CreateDonanteDto) {}
