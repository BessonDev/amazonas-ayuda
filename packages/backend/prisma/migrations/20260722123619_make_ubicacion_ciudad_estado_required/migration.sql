/*
  Warnings:

  - Made the column `ciudad` on table `ubicaciones` required. This step will fail if there are existing NULL values in that column.
  - Made the column `estado` on table `ubicaciones` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "lotes" ALTER COLUMN "deleted_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "movimientos_inventario" ALTER COLUMN "deleted_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ubicaciones" ALTER COLUMN "ciudad" SET NOT NULL,
ALTER COLUMN "estado" SET NOT NULL;

-- CreateIndex
CREATE INDEX "ubicaciones_ciudad_estado_idx" ON "ubicaciones"("ciudad", "estado");
