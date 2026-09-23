"use server";

// Server Actions para Alumnas y CompraPack reales (Bloque 3). Todavía sin asistencias,
// recuperaciones ni asignación a ClaseRecurrente: eso llega con la grilla real de alumnas.

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import { can } from "@/lib/auth/rbac";
import { registrarAuditoria } from "@/lib/audit";

type ActionResult<T = object> = ({ ok: true } & T) | { ok: false; error: string };

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "admin:access")) return null;
  return user;
}

function soloDigitos(s: string) {
  return s.replace(/\D/g, "");
}

export interface DatosAlumna {
  nombre: string;
  apellido: string;
  telefono?: string;
  dni?: string;
  email?: string;
  disciplinas?: string;
  diasHorarios?: string;
}

function limpiar(v?: string) {
  const t = v?.trim();
  return t ? t : null;
}

export async function crearAlumnaAction(datos: DatosAlumna): Promise<ActionResult<{ id: string }>> {
  const user = await requireAdmin();
  if (!user) return { ok: false, error: "No autorizado." };

  const nombre = datos.nombre.trim();
  const apellido = datos.apellido.trim();
  if (!nombre) return { ok: false, error: "El nombre es obligatorio." };

  const dni = datos.dni ? soloDigitos(datos.dni) : null;
  if (dni) {
    const existente = await prisma.alumna.findUnique({ where: { dni } });
    if (existente) return { ok: false, error: `Ya existe una alumna con ese DNI (${existente.nombre} ${existente.apellido}).` };
  }

  const alumna = await prisma.alumna.create({
    data: {
      nombre, apellido,
      telefono: limpiar(datos.telefono),
      dni,
      email: limpiar(datos.email)?.toLowerCase() ?? null,
      disciplinas: limpiar(datos.disciplinas),
      diasHorarios: limpiar(datos.diasHorarios),
      activa: true,
    },
  });

  await registrarAuditoria({
    actorUserId: user.id, actorRole: user.role,
    action: "alumnas.crear", entityType: "Alumna", entityId: alumna.id,
    metadata: { nombre, apellido },
  });

  return { ok: true, id: alumna.id };
}

export async function editarAlumnaAction(id: string, datos: DatosAlumna): Promise<ActionResult> {
  const user = await requireAdmin();
  if (!user) return { ok: false, error: "No autorizado." };

  const actual = await prisma.alumna.findUnique({ where: { id } });
  if (!actual) return { ok: false, error: "La alumna no existe." };

  const nombre = datos.nombre.trim();
  const apellido = datos.apellido.trim();
  if (!nombre) return { ok: false, error: "El nombre es obligatorio." };

  const dni = datos.dni ? soloDigitos(datos.dni) : null;
  if (dni && dni !== actual.dni) {
    const existente = await prisma.alumna.findUnique({ where: { dni } });
    if (existente && existente.id !== id) return { ok: false, error: `Ya existe otra alumna con ese DNI.` };
  }

  await prisma.alumna.update({
    where: { id },
    data: {
      nombre, apellido,
      telefono: limpiar(datos.telefono),
      dni,
      email: limpiar(datos.email)?.toLowerCase() ?? null,
      disciplinas: limpiar(datos.disciplinas),
      diasHorarios: limpiar(datos.diasHorarios),
    },
  });

  await registrarAuditoria({
    actorUserId: user.id, actorRole: user.role,
    action: "alumnas.editar", entityType: "Alumna", entityId: id,
  });

  return { ok: true };
}

export async function cambiarEstadoAlumnaAction(id: string, activa: boolean): Promise<ActionResult> {
  const user = await requireAdmin();
  if (!user) return { ok: false, error: "No autorizado." };

  const actual = await prisma.alumna.findUnique({ where: { id } });
  if (!actual) return { ok: false, error: "La alumna no existe." };
  if (actual.activa === activa) return { ok: true };

  await prisma.alumna.update({ where: { id }, data: { activa } });

  await registrarAuditoria({
    actorUserId: user.id, actorRole: user.role,
    action: activa ? "alumnas.reactivar" : "alumnas.dar_de_baja",
    entityType: "Alumna", entityId: id,
  });

  return { ok: true };
}

export interface DatosCompraPack {
  planPackId?: string;
  clasesContratadas: number;
  precioAplicado: number;
  fechaInicio: string; // ISO yyyy-mm-dd
  fechaFin?: string; // ISO yyyy-mm-dd, opcional
}

/** Crea un pack nuevo (alta o renovación). Nunca modifica un CompraPack anterior. */
export async function crearCompraPackAction(alumnaId: string, datos: DatosCompraPack): Promise<ActionResult<{ id: string }>> {
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
  const fechaInicio = new Date(datos.fechaInicio);
  if (isNaN(fechaInicio.getTime())) return { ok: false, error: "La fecha de inicio no es válida." };
  const fechaFin = datos.fechaFin ? new Date(datos.fechaFin) : null;
  if (fechaFin && isNaN(fechaFin.getTime())) return { ok: false, error: "La fecha de fin no es válida." };

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
      estado: "ACTIVO",
    },
  });

  await registrarAuditoria({
    actorUserId: user.id, actorRole: user.role,
    action: "packs.crear", entityType: "CompraPack", entityId: compra.id,
    metadata: { alumnaId, clases: datos.clasesContratadas, precio: datos.precioAplicado },
  });

  return { ok: true, id: compra.id };
}
