-- CreateEnum
CREATE TYPE "EstadoAsistencia" AS ENUM ('PENDIENTE', 'PRESENTE', 'AUSENTE_CON_AVISO', 'AUSENTE_SIN_AVISO');

-- CreateEnum
CREATE TYPE "TipoReserva" AS ENUM ('HABITUAL', 'RECUPERACION');

-- CreateEnum
CREATE TYPE "EstadoRecuperacion" AS ENUM ('PENDIENTE', 'UTILIZADA', 'PERDIDA', 'VENCIDA');

-- DropForeignKey
ALTER TABLE "Ausencia" DROP CONSTRAINT "Ausencia_alumnaId_fkey";

-- DropForeignKey
ALTER TABLE "Ausencia" DROP CONSTRAINT "Ausencia_claseOcurrenciaId_fkey";

-- DropForeignKey
ALTER TABLE "Recuperacion" DROP CONSTRAINT "Recuperacion_ausenciaId_fkey";

-- DropIndex
DROP INDEX "Recuperacion_ausenciaId_key";

-- AlterTable
ALTER TABLE "Asistencia" DROP COLUMN "presente",
ADD COLUMN     "avisoFecha" TIMESTAMP(3),
ADD COLUMN     "avisoValido" BOOLEAN,
ADD COLUMN     "compraPackConsumidoId" TEXT,
ADD COLUMN     "estado" "EstadoAsistencia" NOT NULL DEFAULT 'PENDIENTE',
ADD COLUMN     "horarioHabitualId" TEXT,
ADD COLUMN     "tipoReserva" "TipoReserva" NOT NULL DEFAULT 'HABITUAL',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Recuperacion" DROP COLUMN "ausenciaId",
ADD COLUMN     "asistenciaOrigenId" TEXT NOT NULL,
ADD COLUMN     "compraPackId" TEXT NOT NULL,
ADD COLUMN     "fechaLimite" TIMESTAMP(3) NOT NULL,
DROP COLUMN "estado",
ADD COLUMN     "estado" "EstadoRecuperacion" NOT NULL DEFAULT 'PENDIENTE';

-- DropTable
DROP TABLE "Ausencia";

-- CreateTable
CREATE TABLE "HorarioHabitual" (
    "id" TEXT NOT NULL,
    "alumnaId" TEXT NOT NULL,
    "claseRecurrenteId" TEXT NOT NULL,
    "desde" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hasta" TIMESTAMP(3),
    "creadoPorUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HorarioHabitual_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HorarioHabitual_alumnaId_idx" ON "HorarioHabitual"("alumnaId");

-- CreateIndex
CREATE INDEX "HorarioHabitual_claseRecurrenteId_idx" ON "HorarioHabitual"("claseRecurrenteId");

-- CreateIndex
CREATE INDEX "Asistencia_claseOcurrenciaId_idx" ON "Asistencia"("claseOcurrenciaId");

-- CreateIndex
CREATE INDEX "Asistencia_compraPackConsumidoId_idx" ON "Asistencia"("compraPackConsumidoId");

-- CreateIndex
CREATE UNIQUE INDEX "Recuperacion_asistenciaOrigenId_key" ON "Recuperacion"("asistenciaOrigenId");

-- CreateIndex
CREATE INDEX "Recuperacion_estado_idx" ON "Recuperacion"("estado");

-- CreateIndex
CREATE INDEX "Recuperacion_fechaLimite_idx" ON "Recuperacion"("fechaLimite");

-- AddForeignKey
ALTER TABLE "HorarioHabitual" ADD CONSTRAINT "HorarioHabitual_alumnaId_fkey" FOREIGN KEY ("alumnaId") REFERENCES "Alumna"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HorarioHabitual" ADD CONSTRAINT "HorarioHabitual_claseRecurrenteId_fkey" FOREIGN KEY ("claseRecurrenteId") REFERENCES "ClaseRecurrente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HorarioHabitual" ADD CONSTRAINT "HorarioHabitual_creadoPorUserId_fkey" FOREIGN KEY ("creadoPorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asistencia" ADD CONSTRAINT "Asistencia_horarioHabitualId_fkey" FOREIGN KEY ("horarioHabitualId") REFERENCES "HorarioHabitual"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asistencia" ADD CONSTRAINT "Asistencia_compraPackConsumidoId_fkey" FOREIGN KEY ("compraPackConsumidoId") REFERENCES "CompraPack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recuperacion" ADD CONSTRAINT "Recuperacion_asistenciaOrigenId_fkey" FOREIGN KEY ("asistenciaOrigenId") REFERENCES "Asistencia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recuperacion" ADD CONSTRAINT "Recuperacion_compraPackId_fkey" FOREIGN KEY ("compraPackId") REFERENCES "CompraPack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

