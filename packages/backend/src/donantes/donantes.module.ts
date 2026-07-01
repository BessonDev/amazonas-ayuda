import { Module } from '@nestjs/common'
import { DonantesController } from './donantes.controller'
import { DonantesService } from './donantes.service'

@Module({
  controllers: [DonantesController],
  providers: [DonantesService],
  exports: [DonantesService],
})
export class DonantesModule {}
