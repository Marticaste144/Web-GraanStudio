-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'ADMIN', 'STUDENT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "displayName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSupport" BOOLEAN NOT NULL DEFAULT false,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "actorRole" "Role",
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alumna" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "telefono" TEXT,
    "dni" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alumna_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profesora" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profesora_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Disciplina" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "aConsulta" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Disciplina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaseRecurrente" (
    "id" TEXT NOT NULL,
    "disciplinaId" TEXT NOT NULL,
    "profesoraId" TEXT NOT NULL,
    "dia" TEXT NOT NULL,
    "hora" TEXT NOT NULL,
    "cupo" INTEGER NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClaseRecurrente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaseOcurrencia" (
    "id" TEXT NOT NULL,
    "claseRecurrenteId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'programada',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClaseOcurrencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pack" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "clasesPorSemana" INTEGER NOT NULL,
    "monto" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AsignacionPack" (
    "id" TEXT NOT NULL,
    "alumnaId" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "desde" TIMESTAMP(3) NOT NULL,
    "hasta" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AsignacionPack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sena" (
    "id" TEXT NOT NULL,
    "alumnaId" TEXT NOT NULL,
    "monto" INTEGER NOT NULL,
    "estado" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sena_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" TEXT NOT NULL,
    "alumnaId" TEXT NOT NULL,
    "monto" INTEGER NOT NULL,
    "medio" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "comprobanteId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comprobante" (
    "id" TEXT NOT NULL,
    "alumnaId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comprobante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asistencia" (
    "id" TEXT NOT NULL,
    "alumnaId" TEXT NOT NULL,
    "claseOcurrenciaId" TEXT NOT NULL,
    "presente" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Asistencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ausencia" (
    "id" TEXT NOT NULL,
    "alumnaId" TEXT NOT NULL,
    "claseOcurrenciaId" TEXT NOT NULL,
    "motivo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ausencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recuperacion" (
    "id" TEXT NOT NULL,
    "alumnaId" TEXT NOT NULL,
    "ausenciaId" TEXT,
    "claseOcurrenciaDestinoId" TEXT,
    "estado" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recuperacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_idx" ON "AuditLog"("actorUserId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Alumna_userId_key" ON "Alumna"("userId");

-- CreateIndex
CREATE INDEX "ClaseRecurrente_dia_hora_idx" ON "ClaseRecurrente"("dia", "hora");

-- CreateIndex
CREATE UNIQUE INDEX "ClaseOcurrencia_claseRecurrenteId_fecha_key" ON "ClaseOcurrencia"("claseRecurrenteId", "fecha");

-- CreateIndex
CREATE INDEX "AsignacionPack_alumnaId_idx" ON "AsignacionPack"("alumnaId");

-- CreateIndex
CREATE INDEX "Sena_alumnaId_idx" ON "Sena"("alumnaId");

-- CreateIndex
CREATE UNIQUE INDEX "Pago_comprobanteId_key" ON "Pago"("comprobanteId");

-- CreateIndex
CREATE INDEX "Pago_alumnaId_idx" ON "Pago"("alumnaId");

-- CreateIndex
CREATE UNIQUE INDEX "Comprobante_storageKey_key" ON "Comprobante"("storageKey");

-- CreateIndex
CREATE INDEX "Comprobante_alumnaId_idx" ON "Comprobante"("alumnaId");

-- CreateIndex
CREATE UNIQUE INDEX "Asistencia_alumnaId_claseOcurrenciaId_key" ON "Asistencia"("alumnaId", "claseOcurrenciaId");

-- CreateIndex
CREATE UNIQUE INDEX "Ausencia_alumnaId_claseOcurrenciaId_key" ON "Ausencia"("alumnaId", "claseOcurrenciaId");

-- CreateIndex
CREATE UNIQUE INDEX "Recuperacion_ausenciaId_key" ON "Recuperacion"("ausenciaId");

-- CreateIndex
CREATE INDEX "Recuperacion_alumnaId_idx" ON "Recuperacion"("alumnaId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alumna" ADD CONSTRAINT "Alumna_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaseRecurrente" ADD CONSTRAINT "ClaseRecurrente_disciplinaId_fkey" FOREIGN KEY ("disciplinaId") REFERENCES "Disciplina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaseRecurrente" ADD CONSTRAINT "ClaseRecurrente_profesoraId_fkey" FOREIGN KEY ("profesoraId") REFERENCES "Profesora"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaseOcurrencia" ADD CONSTRAINT "ClaseOcurrencia_claseRecurrenteId_fkey" FOREIGN KEY ("claseRecurrenteId") REFERENCES "ClaseRecurrente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionPack" ADD CONSTRAINT "AsignacionPack_alumnaId_fkey" FOREIGN KEY ("alumnaId") REFERENCES "Alumna"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionPack" ADD CONSTRAINT "AsignacionPack_packId_fkey" FOREIGN KEY ("packId") REFERENCES "Pack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sena" ADD CONSTRAINT "Sena_alumnaId_fkey" FOREIGN KEY ("alumnaId") REFERENCES "Alumna"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_alumnaId_fkey" FOREIGN KEY ("alumnaId") REFERENCES "Alumna"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_comprobanteId_fkey" FOREIGN KEY ("comprobanteId") REFERENCES "Comprobante"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comprobante" ADD CONSTRAINT "Comprobante_alumnaId_fkey" FOREIGN KEY ("alumnaId") REFERENCES "Alumna"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asistencia" ADD CONSTRAINT "Asistencia_alumnaId_fkey" FOREIGN KEY ("alumnaId") REFERENCES "Alumna"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asistencia" ADD CONSTRAINT "Asistencia_claseOcurrenciaId_fkey" FOREIGN KEY ("claseOcurrenciaId") REFERENCES "ClaseOcurrencia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ausencia" ADD CONSTRAINT "Ausencia_alumnaId_fkey" FOREIGN KEY ("alumnaId") REFERENCES "Alumna"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ausencia" ADD CONSTRAINT "Ausencia_claseOcurrenciaId_fkey" FOREIGN KEY ("claseOcurrenciaId") REFERENCES "ClaseOcurrencia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recuperacion" ADD CONSTRAINT "Recuperacion_alumnaId_fkey" FOREIGN KEY ("alumnaId") REFERENCES "Alumna"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recuperacion" ADD CONSTRAINT "Recuperacion_ausenciaId_fkey" FOREIGN KEY ("ausenciaId") REFERENCES "Ausencia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recuperacion" ADD CONSTRAINT "Recuperacion_claseOcurrenciaDestinoId_fkey" FOREIGN KEY ("claseOcurrenciaDestinoId") REFERENCES "ClaseOcurrencia"("id") ON DELETE SET NULL ON UPDATE CASCADE;
