import "server-only";

import type { Prisma, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

interface RegistrarAuditoria {
  actorUserId: string | null;
  actorRole: Role | null;
  action: string;
  entityType: string;
  entityId?: string;
  /** Metadata mínima y no sensible: nunca contraseñas, tokens ni comprobantes completos. */
  metadata?: Prisma.InputJsonValue;
}

/**
 * Auditoría base para acciones sensibles (login, logout, cambios de contraseña y, más adelante,
 * aprobaciones de pago, cambios de pack/asistencia, etc). La cuenta ADMIN es compartida por
 * Vicky y Amy: acá siempre queda registrada como el mismo usuario/rol "ADMIN", sin distinguir
 * cuál de las dos actuó.
 */
export async function registrarAuditoria(entrada: RegistrarAuditoria) {
  await prisma.auditLog.create({
    data: {
      actorUserId: entrada.actorUserId,
      actorRole: entrada.actorRole,
      action: entrada.action,
      entityType: entrada.entityType,
      entityId: entrada.entityId,
      metadata: entrada.metadata,
    },
  });
}
