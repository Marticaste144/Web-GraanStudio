"use server";

// Server Actions del Bloque 4: catálogo de precios, packs (crear/renovar/cancelar/transiciones
// de estado), pagos y señas. Todo protegido server-side con el RBAC existente — nunca alcanza
// con ocultar un botón en la UI.

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import { can } from "@/lib/auth/rbac";
import { registrarAuditoria } from "@/lib/audit";
import { MEDIOS_PAGO_NUEVOS, type MedioPagoNuevo } from "@/lib/packs/config";

type ActionResult<T = object> = ({ ok: true } & T) | { ok: false; error: string };

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "admin:access")) return null;
  return user;
}

async function requireOwner() {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "admin:financials")) return null;
  return user;
}

// ---------------------------------------------------------------------------
// Catálogo de precios (PlanPack) — exclusivo OWNER
// ---------------------------------------------------------------------------

export async function actualizarPrecioPlanAction(planPackId: string, nuevoPrecio: number): Promise<ActionResult> {
  const user = await requireOwner();
  if (!user) return { ok: false, error: "No autorizado. Solo la dueña puede modificar el catálogo de precios." };

  if (!Number.isInteger(nuevoPrecio) || nuevoPrecio < 0) return { ok: false, error: "El precio no puede ser negativo." };

  const plan = await prisma.planPack.findUnique({ where: { id: planPackId } });
  if (!plan) return { ok: false, error: "El plan no existe." };
  if (plan.precio === nuevoPrecio) return { ok: true };

  await prisma.planPack.update({ where: { id: planPackId }, data: { precio: nuevoPrecio } });

  await registrarAuditoria({
    actorUserId: user.id, actorRole: user.role,
    action: "planpack.editar", entityType: "PlanPack", entityId: planPackId,
    metadata: { clases: plan.clases, precioAnterior: plan.precio, precioNuevo: nuevoPrecio },
  });

  return { ok: true };
}

// ---------------------------------------------------------------------------
// CompraPack: crear/renovar (misma operación), transiciones de estado
// ---------------------------------------------------------------------------

export interface DatosCompraPack {
  planPackId?: string;
  clasesContratadas: number;
  precioAplicado: number;
  fechaInicio: string; // ISO yyyy-mm-dd
  fechaFin?: string; // ISO yyyy-mm-dd, opcional — no se calcula automáticamente (Bloque 5)
  estado: "PENDIENTE" | "ACTIVO";
}

/** Crear y renovar son la misma operación: SIEMPRE una fila nueva, nunca se pisa la anterior. */
export async function crearCompraPackAction(
  alumnaId: string,
  datos: DatosCompraPack,
  opts?: { esRenovacion?: boolean },
): Promise<ActionResult<{ id: string }>> {
  const user = await requireAdmin();
  if (!user) return { ok: false, error: "No autorizado." };

  const alumna = await prisma.alumna.findUnique({ where: { id: alumnaId } });
  if (!alumna) return { ok: false, error: "La alumna no existe." };

  if (!Number.isInteger(datos.clasesContratadas) || datos.clasesContratadas < 1) {
    return { ok: false, error: "La cantidad de clases tiene que ser un número de 1 o más." };
  }
  if (!Number.isInteger(datos.precioAplicado) || datos.precioAplicado < 0) {
    return { ok: false, error: "El precio no puede ser negativo." };
  }
  if (datos.estado !== "PENDIENTE" && datos.estado !== "ACTIVO") {
    return { ok: false, error: "Estado inicial inválido." };
  }
  const fechaInicio = new Date(datos.fechaInicio);
  if (isNaN(fechaInicio.getTime())) return { ok: false, error: "La fecha de inicio no es válida." };
  const fechaFin = datos.fechaFin ? new Date(datos.fechaFin) : null;
  if (fechaFin && isNaN(fechaFin.getTime())) return { ok: false, error: "La fecha de fin no es válida." };

  if (datos.planPackId) {
    const plan = await prisma.planPack.findUnique({ where: { id: datos.planPackId } });
    if (!plan) return { ok: false, error: "El plan elegido no existe." };
  }

  const compra = await prisma.compraPack.create({
    data: {
      alumnaId,
      planPackId: datos.planPackId || null,
      clasesContratadas: datos.clasesContratadas,
      precioAplicado: datos.precioAplicado,
      fechaInicio,
      fechaFin,
      clasesTomadas: 0,
      clasesRestantes: datos.clasesContratadas,
      estado: datos.estado,
    },
  });

  await registrarAuditoria({
    actorUserId: user.id, actorRole: user.role,
    action: opts?.esRenovacion ? "packs.renovar" : "packs.crear",
    entityType: "CompraPack", entityId: compra.id,
    metadata: { alumnaId, clases: datos.clasesContratadas, precio: datos.precioAplicado, estado: datos.estado },
  });

  return { ok: true, id: compra.id };
}

async function transicionCompraPack(
  compraPackId: string,
  desde: readonly string[],
  hasta: "ACTIVO" | "FINALIZADO" | "CANCELADO",
  accion: string,
): Promise<ActionResult> {
  const user = await requireAdmin();
  if (!user) return { ok: false, error: "No autorizado." };

  const compra = await prisma.compraPack.findUnique({ where: { id: compraPackId } });
  if (!compra) return { ok: false, error: "El pack no existe." };
  if (!desde.includes(compra.estado)) {
    return { ok: false, error: `No se puede pasar de ${compra.estado} a ${hasta}.` };
  }

  await prisma.compraPack.update({ where: { id: compraPackId }, data: { estado: hasta } });

  await registrarAuditoria({
    actorUserId: user.id, actorRole: user.role,
    action: accion, entityType: "CompraPack", entityId: compraPackId,
    metadata: { estadoAnterior: compra.estado, estadoNuevo: hasta },
  });

  return { ok: true };
}

export async function activarCompraPackAction(id: string): Promise<ActionResult> {
  return transicionCompraPack(id, ["PENDIENTE"], "ACTIVO", "packs.activar");
}
export async function finalizarCompraPackAction(id: string): Promise<ActionResult> {
  return transicionCompraPack(id, ["ACTIVO"], "FINALIZADO", "packs.finalizar");
}
export async function cancelarCompraPackAction(id: string): Promise<ActionResult> {
  return transicionCompraPack(id, ["PENDIENTE", "ACTIVO"], "CANCELADO", "packs.cancelar");
}

// ---------------------------------------------------------------------------
// Pagos
// ---------------------------------------------------------------------------

export interface DatosPago {
  monto: number;
  medio: MedioPagoNuevo;
  fechaPago: string; // ISO yyyy-mm-dd
}

export async function registrarPagoAction(alumnaId: string, compraPackId: string, datos: DatosPago): Promise<ActionResult<{ id: string }>> {
  const user = await requireAdmin();
  if (!user) return { ok: false, error: "No autorizado." };

  if (!Number.isInteger(datos.monto) || datos.monto <= 0) return { ok: false, error: "El monto tiene que ser mayor a cero." };
  if (!MEDIOS_PAGO_NUEVOS.includes(datos.medio)) return { ok: false, error: "Método de pago no válido." };
  const fechaPago = new Date(datos.fechaPago);
  if (isNaN(fechaPago.getTime())) return { ok: false, error: "La fecha no es válida." };

  const compra = await prisma.compraPack.findUnique({ where: { id: compraPackId } });
  if (!compra) return { ok: false, error: "El pack no existe." };
  if (compra.alumnaId !== alumnaId) return { ok: false, error: "Ese pack no pertenece a esta alumna." };

  const pago = await prisma.pago.create({
    data: { alumnaId, compraPackId, monto: datos.monto, medio: datos.medio, estado: "Aprobado", fechaPago },
  });

  await registrarAuditoria({
    actorUserId: user.id, actorRole: user.role,
    action: "pagos.registrar", entityType: "Pago", entityId: pago.id,
    metadata: { alumnaId, compraPackId, monto: datos.monto, medio: datos.medio },
  });

  return { ok: true, id: pago.id };
}

// ---------------------------------------------------------------------------
// Señas
// ---------------------------------------------------------------------------

export interface DatosSena {
  monto: number;
  medio: MedioPagoNuevo;
  fecha: string; // ISO yyyy-mm-dd
}

/** Siempre nace PENDIENTE y sin pack asociado: aplicarla es un paso aparte (aplicarSenaAction). */
export async function registrarSenaAction(alumnaId: string, datos: DatosSena): Promise<ActionResult<{ id: string }>> {
  const user = await requireAdmin();
  if (!user) return { ok: false, error: "No autorizado." };

  if (!Number.isInteger(datos.monto) || datos.monto <= 0) return { ok: false, error: "El monto tiene que ser mayor a cero." };
  if (!MEDIOS_PAGO_NUEVOS.includes(datos.medio)) return { ok: false, error: "Método de pago no válido." };
  const fecha = new Date(datos.fecha);
  if (isNaN(fecha.getTime())) return { ok: false, error: "La fecha no es válida." };

  const alumna = await prisma.alumna.findUnique({ where: { id: alumnaId } });
  if (!alumna) return { ok: false, error: "La alumna no existe." };

  const sena = await prisma.sena.create({
    data: { alumnaId, monto: datos.monto, medio: datos.medio, fecha, estado: "PENDIENTE", registradoPorUserId: user.id },
  });

  await registrarAuditoria({
    actorUserId: user.id, actorRole: user.role,
    action: "senas.registrar", entityType: "Sena", entityId: sena.id,
    metadata: { alumnaId, monto: datos.monto, medio: datos.medio },
  });

  return { ok: true, id: sena.id };
}

export async function aplicarSenaAction(senaId: string, compraPackId: string): Promise<ActionResult> {
  const user = await requireAdmin();
  if (!user) return { ok: false, error: "No autorizado." };

  const [sena, compra] = await Promise.all([
    prisma.sena.findUnique({ where: { id: senaId } }),
    prisma.compraPack.findUnique({ where: { id: compraPackId } }),
  ]);
  if (!sena) return { ok: false, error: "La seña no existe." };
  if (!compra) return { ok: false, error: "El pack no existe." };
  if (sena.estado !== "PENDIENTE") return { ok: false, error: `Esta seña ya está ${sena.estado === "APLICADA" ? "aplicada" : "retenida"}: no se puede aplicar de nuevo.` };
  if (sena.alumnaId !== compra.alumnaId) return { ok: false, error: "La seña y el pack no son de la misma alumna." };

  await prisma.sena.update({
    where: { id: senaId },
    data: { estado: "APLICADA", compraPackId, fechaAplicacion: new Date() },
  });

  await registrarAuditoria({
    actorUserId: user.id, actorRole: user.role,
    action: "senas.aplicar", entityType: "Sena", entityId: senaId,
    metadata: { compraPackId, monto: sena.monto },
  });

  return { ok: true };
}

export async function retenerSenaAction(senaId: string): Promise<ActionResult> {
  const user = await requireAdmin();
  if (!user) return { ok: false, error: "No autorizado." };

  const sena = await prisma.sena.findUnique({ where: { id: senaId } });
  if (!sena) return { ok: false, error: "La seña no existe." };
  if (sena.estado !== "PENDIENTE") return { ok: false, error: "Esta seña ya no está pendiente." };

  await prisma.sena.update({ where: { id: senaId }, data: { estado: "RETENIDA" } });

  await registrarAuditoria({
    actorUserId: user.id, actorRole: user.role,
    action: "senas.retener", entityType: "Sena", entityId: senaId,
    metadata: { alumnaId: sena.alumnaId, monto: sena.monto },
  });

  return { ok: true };
}
