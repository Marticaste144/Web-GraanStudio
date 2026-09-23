-- CreateEnum
CREATE TYPE "EstadoCompraPack" AS ENUM ('ACTIVO', 'FINALIZADO', 'CANCELADO');

-- DropForeignKey
ALTER TABLE "AsignacionPack" DROP CONSTRAINT "AsignacionPack_alumnaId_fkey";

-- DropForeignKey
ALTER TABLE "AsignacionPack" DROP CONSTRAINT "AsignacionPack_packId_fkey";

-- AlterTable
ALTER TABLE "Alumna" ADD COLUMN     "diasHorarios" TEXT,
ADD COLUMN     "disciplinas" TEXT,
ADD COLUMN     "email" TEXT;

-- AlterTable
ALTER TABLE "Pago" ADD COLUMN     "compraPackId" TEXT,
ADD COLUMN     "fechaPago" TIMESTAMP(3),
ALTER COLUMN "medio" DROP NOT NULL;

-- DropTable
DROP TABLE "AsignacionPack";

-- DropTable
DROP TABLE "Pack";

-- CreateTable
CREATE TABLE "PlanPack" (
    "id" TEXT NOT NULL,
    "clases" INTEGER NOT NULL,
    "precio" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanPack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompraPack" (
    "id" TEXT NOT NULL,
    "alumnaId" TEXT NOT NULL,
    "planPackId" TEXT,
    "clasesContratadas" INTEGER NOT NULL,
    "precioAplicado" INTEGER NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "clasesTomadas" INTEGER NOT NULL DEFAULT 0,
    "clasesRestantes" INTEGER NOT NULL DEFAULT 0,
    "estado" "EstadoCompraPack" NOT NULL DEFAULT 'ACTIVO',
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompraPack_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlanPack_clases_key" ON "PlanPack"("clases");

-- CreateIndex
CREATE INDEX "CompraPack_alumnaId_idx" ON "CompraPack"("alumnaId");

-- CreateIndex
CREATE UNIQUE INDEX "Alumna_dni_key" ON "Alumna"("dni");

-- CreateIndex
CREATE INDEX "Pago_compraPackId_idx" ON "Pago"("compraPackId");

-- AddForeignKey
ALTER TABLE "CompraPack" ADD CONSTRAINT "CompraPack_alumnaId_fkey" FOREIGN KEY ("alumnaId") REFERENCES "Alumna"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompraPack" ADD CONSTRAINT "CompraPack_planPackId_fkey" FOREIGN KEY ("planPackId") REFERENCES "PlanPack"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_compraPackId_fkey" FOREIGN KEY ("compraPackId") REFERENCES "CompraPack"("id") ON DELETE SET NULL ON UPDATE CASCADE;

