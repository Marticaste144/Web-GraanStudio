-- CreateEnum
CREATE TYPE "EstadoSena" AS ENUM ('PENDIENTE', 'APLICADA', 'RETENIDA');

-- AlterEnum
ALTER TYPE "EstadoCompraPack" ADD VALUE 'PENDIENTE';

-- AlterTable
ALTER TABLE "Sena" ADD COLUMN     "compraPackId" TEXT,
ADD COLUMN     "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fechaAplicacion" TIMESTAMP(3),
ADD COLUMN     "medio" TEXT,
ADD COLUMN     "registradoPorUserId" TEXT,
DROP COLUMN "estado",
ADD COLUMN     "estado" "EstadoSena" NOT NULL DEFAULT 'PENDIENTE';

-- CreateIndex
CREATE INDEX "Sena_compraPackId_idx" ON "Sena"("compraPackId");

-- AddForeignKey
ALTER TABLE "Sena" ADD CONSTRAINT "Sena_compraPackId_fkey" FOREIGN KEY ("compraPackId") REFERENCES "CompraPack"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sena" ADD CONSTRAINT "Sena_registradoPorUserId_fkey" FOREIGN KEY ("registradoPorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

