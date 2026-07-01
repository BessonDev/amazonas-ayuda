import { PartialType } from '@nestjs/swagger'
import { CreateViajeDto } from './create-viaje.dto'

export class UpdateViajeDto extends PartialType(CreateViajeDto) {}
