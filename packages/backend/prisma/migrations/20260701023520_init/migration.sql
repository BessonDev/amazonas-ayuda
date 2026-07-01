-- CreateEnum
CREATE TYPE "RolNombre" AS ENUM ('ADMINISTRADOR', 'COORDINADOR_LOGISTICO', 'OPERADOR_INVENTARIO', 'RESPONSABLE_DESTINO');

-- CreateEnum
CREATE TYPE "EstadoCampania" AS ENUM ('PLANIFICADA', 'ACTIVA', 'PAUSADA', 'FINALIZADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TipoDonante" AS ENUM ('PERSONA', 'EMPRESA', 'IGLESIA', 'FUNDACION', 'ANONIMO');

-- CreateEnum
CREATE TYPE "EstadoLote" AS ENUM ('REGISTRADO', 'DISPONIBLE', 'RESERVADO', 'EN_TRANSITO', 'ENTREGADO', 'VERIFICADO', 'DISTRIBUIDO');

-- CreateEnum
CREATE TYPE "TipoMovimiento" AS ENUM ('ENTRADA', 'RESERVA', 'TRANSFERENCIA', 'ENVIO', 'RECEPCION', 'AJUSTE', 'DISTRIBUCION', 'CONSUMO');

-- CreateEnum
CREATE TYPE "EstadoViaje" AS ENUM ('PLANIFICADO', 'PREPARANDO_CARGA', 'EN_TRANSITO', 'LLEGO', 'RECEPCION_PARCIAL', 'COMPLETADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "PrioridadSolicitud" AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'URGENTE');

-- CreateEnum
CREATE TYPE "EstadoSolicitud" AS ENUM ('ABIERTA', 'EN_PROCESO', 'COMPLETADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "UnidadMedida" AS ENUM ('UNIDAD', 'KILO', 'LITRO', 'CAJA', 'BOLSA', 'PAQUETE', 'GALON', 'TONELADA', 'PAR', 'OTRO');

-- CreateTable
CREATE TABLE "campanias" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaFin" TIMESTAMP(3),
    "estado" "EstadoCampania" NOT NULL DEFAULT 'PLANIFICADA',
    "imagenUrl" TEXT,
    "objetivo" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campanias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "nombre" "RolNombre" NOT NULL,
    "descripcion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permisos" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles_permisos" (
    "rolId" INTEGER NOT NULL,
    "permisoId" INTEGER NOT NULL,

    CONSTRAINT "roles_permisos_pkey" PRIMARY KEY ("rolId","permisoId")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "telefono" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimo_acceso" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "rolId" INTEGER NOT NULL,
    "ubicacionId" INTEGER,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_ubicacion" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tipos_ubicacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ubicaciones" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT,
    "ciudad" TEXT,
    "estado" TEXT,
    "pais" TEXT NOT NULL DEFAULT 'Venezuela',
    "contacto" TEXT,
    "telefono" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "tipoId" INTEGER NOT NULL,
    "campaniaId" INTEGER NOT NULL,

    CONSTRAINT "ubicaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "icono" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "unidad" "UnidadMedida" NOT NULL DEFAULT 'UNIDAD',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "categoriaId" INTEGER NOT NULL,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donantes" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoDonante" NOT NULL DEFAULT 'ANONIMO',
    "nombre" TEXT,
    "documento" TEXT,
    "email" TEXT,
    "telefono" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "donantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lotes" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observaciones" TEXT,
    "estado" "EstadoLote" NOT NULL DEFAULT 'REGISTRADO',
    "qrUrl" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "campaniaId" INTEGER NOT NULL,
    "ubicacionId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "donanteId" INTEGER,
    "responsableId" INTEGER,

    CONSTRAINT "lotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimientos_inventario" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoMovimiento" NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "saldo_anterior" INTEGER,
    "saldo_nuevo" INTEGER,
    "observaciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "loteId" INTEGER NOT NULL,
    "ubicacionId" INTEGER NOT NULL,
    "responsableId" INTEGER,
    "campaniaId" INTEGER NOT NULL,
    "viajeId" INTEGER,

    CONSTRAINT "movimientos_inventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "viajes" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre_responsable" TEXT,
    "vehiculo" TEXT,
    "conductor" TEXT,
    "fechaSalida" TIMESTAMP(3),
    "fechaEstimada" TIMESTAMP(3),
    "fechaLlegada" TIMESTAMP(3),
    "observaciones" TEXT,
    "estado" "EstadoViaje" NOT NULL DEFAULT 'PLANIFICADO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "campaniaId" INTEGER NOT NULL,
    "origenId" INTEGER NOT NULL,
    "destinoId" INTEGER NOT NULL,
    "responsableId" INTEGER,

    CONSTRAINT "viajes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detalles_viaje" (
    "id" SERIAL NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "viajeId" INTEGER NOT NULL,
    "loteId" INTEGER NOT NULL,

    CONSTRAINT "detalles_viaje_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recepciones" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observaciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "viajeId" INTEGER NOT NULL,
    "responsableId" INTEGER,

    CONSTRAINT "recepciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detalles_recepcion" (
    "id" SERIAL NOT NULL,
    "cantidad_recibida" INTEGER NOT NULL,
    "cantidad_faltante" INTEGER NOT NULL DEFAULT 0,
    "cantidad_danada" INTEGER NOT NULL DEFAULT 0,
    "observaciones" TEXT,
    "recepcionId" INTEGER NOT NULL,
    "loteId" INTEGER NOT NULL,

    CONSTRAINT "detalles_recepcion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitudes" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "prioridad" "PrioridadSolicitud" NOT NULL DEFAULT 'MEDIA',
    "estado" "EstadoSolicitud" NOT NULL DEFAULT 'ABIERTA',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "campaniaId" INTEGER NOT NULL,
    "ubicacionId" INTEGER NOT NULL,

    CONSTRAINT "solicitudes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detalles_solicitud" (
    "id" SERIAL NOT NULL,
    "meta" INTEGER NOT NULL,
    "recibido" INTEGER NOT NULL DEFAULT 0,
    "descripcion" TEXT,
    "solicitudId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,

    CONSTRAINT "detalles_solicitud_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "archivos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "tamanio" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entidad_tipo" TEXT NOT NULL,
    "entidad_id" INTEGER NOT NULL,
    "campaniaId" INTEGER,
    "viajeId" INTEGER,

    CONSTRAINT "archivos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditoria" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER,
    "accion" TEXT NOT NULL,
    "entidad_tipo" TEXT NOT NULL,
    "entidad_id" INTEGER,
    "valor_anterior" TEXT,
    "valor_nuevo" TEXT,
    "ip" TEXT,
    "dispositivo" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "campaniaId" INTEGER,

    CONSTRAINT "auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion" (
    "id" SERIAL NOT NULL,
    "clave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,

    CONSTRAINT "configuracion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "permisos_codigo_key" ON "permisos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_ubicacion_nombre_key" ON "tipos_ubicacion"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_nombre_key" ON "categorias"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "lotes_codigo_key" ON "lotes"("codigo");

-- CreateIndex
CREATE INDEX "lotes_campaniaId_idx" ON "lotes"("campaniaId");

-- CreateIndex
CREATE INDEX "lotes_ubicacionId_idx" ON "lotes"("ubicacionId");

-- CreateIndex
CREATE INDEX "lotes_productoId_idx" ON "lotes"("productoId");

-- CreateIndex
CREATE INDEX "lotes_estado_idx" ON "lotes"("estado");

-- CreateIndex
CREATE INDEX "movimientos_inventario_loteId_idx" ON "movimientos_inventario"("loteId");

-- CreateIndex
CREATE INDEX "movimientos_inventario_ubicacionId_idx" ON "movimientos_inventario"("ubicacionId");

-- CreateIndex
CREATE INDEX "movimientos_inventario_tipo_idx" ON "movimientos_inventario"("tipo");

-- CreateIndex
CREATE INDEX "movimientos_inventario_created_at_idx" ON "movimientos_inventario"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "viajes_codigo_key" ON "viajes"("codigo");

-- CreateIndex
CREATE INDEX "viajes_campaniaId_idx" ON "viajes"("campaniaId");

-- CreateIndex
CREATE INDEX "viajes_estado_idx" ON "viajes"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "detalles_viaje_viajeId_loteId_key" ON "detalles_viaje"("viajeId", "loteId");

-- CreateIndex
CREATE UNIQUE INDEX "detalles_recepcion_recepcionId_loteId_key" ON "detalles_recepcion"("recepcionId", "loteId");

-- CreateIndex
CREATE INDEX "solicitudes_campaniaId_idx" ON "solicitudes"("campaniaId");

-- CreateIndex
CREATE INDEX "solicitudes_estado_idx" ON "solicitudes"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "detalles_solicitud_solicitudId_productoId_key" ON "detalles_solicitud"("solicitudId", "productoId");

-- CreateIndex
CREATE INDEX "archivos_entidad_tipo_entidad_id_idx" ON "archivos"("entidad_tipo", "entidad_id");

-- CreateIndex
CREATE INDEX "auditoria_entidad_tipo_entidad_id_idx" ON "auditoria"("entidad_tipo", "entidad_id");

-- CreateIndex
CREATE INDEX "auditoria_usuarioId_idx" ON "auditoria"("usuarioId");

-- CreateIndex
CREATE INDEX "auditoria_created_at_idx" ON "auditoria"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "configuracion_clave_key" ON "configuracion"("clave");

-- AddForeignKey
ALTER TABLE "roles_permisos" ADD CONSTRAINT "roles_permisos_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles_permisos" ADD CONSTRAINT "roles_permisos_permisoId_fkey" FOREIGN KEY ("permisoId") REFERENCES "permisos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_ubicacionId_fkey" FOREIGN KEY ("ubicacionId") REFERENCES "ubicaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ubicaciones" ADD CONSTRAINT "ubicaciones_tipoId_fkey" FOREIGN KEY ("tipoId") REFERENCES "tipos_ubicacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ubicaciones" ADD CONSTRAINT "ubicaciones_campaniaId_fkey" FOREIGN KEY ("campaniaId") REFERENCES "campanias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lotes" ADD CONSTRAINT "lotes_campaniaId_fkey" FOREIGN KEY ("campaniaId") REFERENCES "campanias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lotes" ADD CONSTRAINT "lotes_ubicacionId_fkey" FOREIGN KEY ("ubicacionId") REFERENCES "ubicaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lotes" ADD CONSTRAINT "lotes_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lotes" ADD CONSTRAINT "lotes_donanteId_fkey" FOREIGN KEY ("donanteId") REFERENCES "donantes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lotes" ADD CONSTRAINT "lotes_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "lotes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_ubicacionId_fkey" FOREIGN KEY ("ubicacionId") REFERENCES "ubicaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_campaniaId_fkey" FOREIGN KEY ("campaniaId") REFERENCES "campanias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viajes" ADD CONSTRAINT "viajes_campaniaId_fkey" FOREIGN KEY ("campaniaId") REFERENCES "campanias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viajes" ADD CONSTRAINT "viajes_origenId_fkey" FOREIGN KEY ("origenId") REFERENCES "ubicaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viajes" ADD CONSTRAINT "viajes_destinoId_fkey" FOREIGN KEY ("destinoId") REFERENCES "ubicaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viajes" ADD CONSTRAINT "viajes_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalles_viaje" ADD CONSTRAINT "detalles_viaje_viajeId_fkey" FOREIGN KEY ("viajeId") REFERENCES "viajes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalles_viaje" ADD CONSTRAINT "detalles_viaje_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "lotes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recepciones" ADD CONSTRAINT "recepciones_viajeId_fkey" FOREIGN KEY ("viajeId") REFERENCES "viajes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recepciones" ADD CONSTRAINT "recepciones_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalles_recepcion" ADD CONSTRAINT "detalles_recepcion_recepcionId_fkey" FOREIGN KEY ("recepcionId") REFERENCES "recepciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalles_recepcion" ADD CONSTRAINT "detalles_recepcion_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "lotes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes" ADD CONSTRAINT "solicitudes_campaniaId_fkey" FOREIGN KEY ("campaniaId") REFERENCES "campanias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes" ADD CONSTRAINT "solicitudes_ubicacionId_fkey" FOREIGN KEY ("ubicacionId") REFERENCES "ubicaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalles_solicitud" ADD CONSTRAINT "detalles_solicitud_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "solicitudes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalles_solicitud" ADD CONSTRAINT "detalles_solicitud_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archivos" ADD CONSTRAINT "archivos_campaniaId_fkey" FOREIGN KEY ("campaniaId") REFERENCES "campanias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archivos" ADD CONSTRAINT "archivos_viajeId_fkey" FOREIGN KEY ("viajeId") REFERENCES "viajes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_campaniaId_fkey" FOREIGN KEY ("campaniaId") REFERENCES "campanias"("id") ON DELETE SET NULL ON UPDATE CASCADE;
