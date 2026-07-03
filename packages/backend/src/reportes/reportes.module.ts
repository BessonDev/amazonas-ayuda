import { Module } from '@nestjs/common'
import { ReportesController } from './reportes.controller'
import { ReportesService } from './reportes.service'
import { InventarioModule } from '../inventario/inventario.module'

@Module({
  imports: [InventarioModule],
  controllers: [ReportesController],
  providers: [ReportesService],
  exports: [ReportesService],
})
export class ReportesModule {}
