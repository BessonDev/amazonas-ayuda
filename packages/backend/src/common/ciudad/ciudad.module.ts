import { Global, Module } from '@nestjs/common';
import { CiudadService } from './ciudad.service';

@Global()
@Module({
  providers: [CiudadService],
  exports: [CiudadService],
})
export class CiudadModule {}