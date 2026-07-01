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
  ],
})
export class AppModule {}
