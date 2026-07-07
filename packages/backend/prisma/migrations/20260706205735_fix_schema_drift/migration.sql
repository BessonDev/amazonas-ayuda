-- Remover columnas obsoletas de lotes (lote-split no implementado)
ALTER TABLE "lotes" DROP CONSTRAINT IF EXISTS "lotes_lotePadreId_fkey";
DROP INDEX IF EXISTS "lotes_lotePadreId_idx";
ALTER TABLE "lotes" DROP COLUMN IF EXISTS "esSplit";
ALTER TABLE "lotes" DROP COLUMN IF EXISTS "lotePadreId";

-- Simplificar enum EstadoLote (eliminar estados no usados)
ALTER TYPE "EstadoLote" RENAME TO "EstadoLote_old";
CREATE TYPE "EstadoLote" AS ENUM ('DISPONIBLE', 'EN_TRANSITO', 'ENTREGADO');
ALTER TABLE "lotes" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TABLE "lotes" ALTER COLUMN "estado" TYPE "EstadoLote" USING "estado"::text::"EstadoLote";
ALTER TABLE "lotes" ALTER COLUMN "estado" SET DEFAULT 'DISPONIBLE';
DROP TYPE "EstadoLote_old";

-- Simplificar enum TipoMovimiento (eliminar tipos no usados)
ALTER TYPE "TipoMovimiento" RENAME TO "TipoMovimiento_old";
CREATE TYPE "TipoMovimiento" AS ENUM ('ENTRADA', 'TRANSFERENCIA', 'ENVIO', 'RECEPCION', 'AJUSTE');
ALTER TABLE "movimientos_inventario" ALTER COLUMN "tipo" TYPE "TipoMovimiento" USING "tipo"::text::"TipoMovimiento";
DROP TYPE "TipoMovimiento_old";

-- Simplificar enum EstadoViaje (eliminar estados no usados)
ALTER TYPE "EstadoViaje" RENAME TO "EstadoViaje_old";
CREATE TYPE "EstadoViaje" AS ENUM ('PLANIFICADO', 'EN_TRANSITO', 'RECEPCION_PARCIAL', 'COMPLETADO', 'CANCELADO');
ALTER TABLE "viajes" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TABLE "viajes" ALTER COLUMN "estado" TYPE "EstadoViaje" USING "estado"::text::"EstadoViaje";
ALTER TABLE "viajes" ALTER COLUMN "estado" SET DEFAULT 'PLANIFICADO';
DROP TYPE "EstadoViaje_old";

-- Agregar columna deleted_at a lotes (soft delete)
ALTER TABLE "lotes" ADD COLUMN "deleted_at" TIMESTAMP;

-- Agregar columna deleted_at a movimientos_inventario
ALTER TABLE "movimientos_inventario" ADD COLUMN "deleted_at" TIMESTAMP;

-- Agregar columna foto_recepcion_url a recepciones
ALTER TABLE "recepciones" ADD COLUMN "foto_recepcion_url" TEXT;
