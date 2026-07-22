import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { UsuariosModule } from './usuarios/usuarios.module'
import { CampaniasModule } from './campanias/campanias.module'
import { UbicacionesModule } from './ubicaciones/ubicaciones.module'
import { CategoriasModule } from './categorias/categorias.module'
import { ProductosModule } from './productos/productos.module'
import { DonantesModule } from './donantes/donantes.module'
import { LotesModule } from './lotes/lotes.module'
import { MovimientosInventarioModule } from './movimientos-inventario/movimientos-inventario.module'
import { ViajesModule } from './viajes/viajes.module'

import { SolicitudesModule } from './solicitudes/solicitudes.module'
import { ArchivosModule } from './archivos/archivos.module'
import { ConfiguracionModule } from './configuracion/configuracion.module'
import { PublicoModule } from './publico/publico.module';
import { InventarioModule } from './inventario/inventario.module';
import { ReportesModule } from './reportes/reportes.module';
import { AuditoriaModule } from './auditoria/auditoria.module';
import { MinioModule } from './common/minio/minio.module';
import { CiudadModule } from './common/ciudad/ciudad.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { ttl: 60000, limit: 100 },
    ]),
    PrismaModule,
    AuthModule,
    UsuariosModule,
    CampaniasModule,
    UbicacionesModule,
    CategoriasModule,
    ProductosModule,
    DonantesModule,
    LotesModule,
    MovimientosInventarioModule,
    ViajesModule,
    SolicitudesModule,
    MinioModule,
    ArchivosModule,
    ConfiguracionModule,
    PublicoModule,
    InventarioModule,
    ReportesModule,
    AuditoriaModule,
    CiudadModule,
  ],
})
export class AppModule {}
