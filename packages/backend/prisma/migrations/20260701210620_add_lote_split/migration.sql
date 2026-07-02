-- AlterTable
ALTER TABLE "lotes" ADD COLUMN     "esSplit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lotePadreId" INTEGER;

-- CreateIndex
CREATE INDEX "lotes_lotePadreId_idx" ON "lotes"("lotePadreId");

-- AddForeignKey
ALTER TABLE "lotes" ADD CONSTRAINT "lotes_lotePadreId_fkey" FOREIGN KEY ("lotePadreId") REFERENCES "lotes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
