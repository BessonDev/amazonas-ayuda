import { PartialType, OmitType } from '@nestjs/swagger'
import { CreateRecepcionDto } from './create-recepcion.dto'

export class UpdateRecepcionDto extends PartialType(
  OmitType(CreateRecepcionDto, ['detalles'] as const),
) {}
