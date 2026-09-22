-- CreateEnum
CREATE TYPE "EstadoOcurrencia" AS ENUM ('PROGRAMADA', 'DICTADA', 'CANCELADA');

-- DropIndex
DROP INDEX "ClaseRecurrente_dia_hora_idx";

-- AlterTable
ALTER TABLE "ClaseOcurrencia" ADD COLUMN     "profesoraRealId" TEXT,
DROP COLUMN "estado",
ADD COLUMN     "estado" "EstadoOcurrencia" NOT NULL DEFAULT 'PROGRAMADA';

-- CreateIndex
CREATE UNIQUE INDEX "ClaseRecurrente_dia_hora_key" ON "ClaseRecurrente"("dia", "hora");

-- CreateIndex
CREATE UNIQUE INDEX "Disciplina_nombre_key" ON "Disciplina"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Profesora_nombre_key" ON "Profesora"("nombre");

-- AddForeignKey
ALTER TABLE "ClaseOcurrencia" ADD CONSTRAINT "ClaseOcurrencia_profesoraRealId_fkey" FOREIGN KEY ("profesoraRealId") REFERENCES "Profesora"("id") ON DELETE SET NULL ON UPDATE CASCADE;

