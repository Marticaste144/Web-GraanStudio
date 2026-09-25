"use server";

// Server Actions del Bloque 5: generación de ocurrencias, horarios habituales, toma/corrección de
// asistencia, y edición operativa de una ocurrencia (profesora real, cancelar/reprogramar). Todo
// protegido server-side con el RBAC existente (admin:access = OWNER+ADMIN, tareas operativas).

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import { can } from "@/lib/auth/rbac";
import { registrarAuditoria } from "@/lib/audit";
import { avisoEsValido, calcularFechaLimiteRecuperacion, seleccionarPackParaConsumo, MENSAJE_ERROR_PACK, type ErrorSeleccionPack } from "./calculos";
import { parseFechaHoraLocalArgentina } from "./semana";
import { DIAS_VIGENCIA_RECUPERACION } from "./config";

type ActionResult<T = object> = ({ ok: true } & T) | { ok: false; error: string };
type Tx = Prisma.TransactionClient;

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "admin:access")) return null;
  return user;
}

// ---------------------------------------------------------------------------
// Ocurrencias
// ---------------------------------------------------------------------------
// La generación de ClaseOcurrencia no es una Server Action: se dispara sola, on-demand, desde el
// Server Component de la grilla (ver lib/grilla/ocurrencias.ts::asegurarOcurrenciasDeSemana). No
// hace falta un botón manual ni que un rol la dispare explícitamente.

export async function cambiarProfesoraRealAction(ocurrenciaId: string, profesoraId: string | null): Promise<ActionResult> {
  const user = await requireAdmin();
  if (!user) return { ok: false, error: "No autorizado." };

  const ocurrencia = await prisma.claseOcurrencia.findUnique({ where: { id: ocurrenciaId } });
  if (!ocurrencia) return { ok: false, error: "La clase no existe." };

  if (profesoraId) {
    const profesora = await prisma.profesora.findUnique({ where: { id: profesoraId } });
    if (!profesora || !profesora.activa) return { ok: false, error: "La profesora elegida no existe o está inactiva." };
  }

  await prisma.claseOcurrencia.update({ where: { id: ocurrenciaId }, data: { profesoraRealId: profesoraId } });

  await registrarAuditoria({
    actorUserId: user.id, actorRole: user.role,
    action: "grilla.cambiar_profesora_real", entityType: "ClaseOcurrencia", entityId: ocurrenciaId,
    metadata: { profesoraId },
  });

  return { ok: true };
}

/** No borra la ocurrencia: la conserva con estado CANCELADA. Restaura cualquier consumo ya registrado y anula recuperaciones pendientes sin asignar todavía (sección 28). */
export async function cancelarOcurrenciaAction(ocurrenciaId: string): Promise<ActionResult> {
  const user = await requireAdmin();
  if (!user) return { ok: false, error: "No autorizado." };

  const ocurrencia = await prisma.claseOcurrencia.findUnique({ where: { id: ocurrenciaId } });
  if (!ocurrencia) return { ok: false, error: "La clase no existe." };
  if (ocurrencia.estado === "CANCELADA") return { ok: true };

  const asistencias = await prisma.asistencia.findMany({ where: { claseOcurrenciaId: ocurrenciaId } });

  await prisma.$transaction(async (tx) => {
    for (const a of asistencias) {
      if (a.compraPackConsumidoId) await restaurarClase(tx, a.compraPackConsumidoId);
      const recuperacion = await tx.recuperacion.findUnique({ where: { asistenciaOrigenId: a.id } });
      if (recuperacion) await tx.recuperacion.delete({ where: { id: recuperacion.id } });
    }
    await tx.asistencia.deleteMany({ where: { claseOcurrenciaId: ocurrenciaId } });
    await tx.claseOcurrencia.update({ where: { id: ocurrenciaId }, data: { estado: "CANCELADA" } });
  });

  await registrarAuditoria({
    actorUserId: user.id, actorRole: user.role,
    action: "grilla.cancelar_ocurrencia", entityType: "ClaseOcurrencia", entityId: ocurrenciaId,
    metadata: { asistenciasAfectadas: asistencias.length },
  });

  return { ok: true };
}

/** Vuelve una ocurrencia CANCELADA a PROGRAMADA (por si fue un error). Nunca desde otro estado. */
export async function reprogramarOcurrenciaAction(ocurrenciaId: string): Promise<ActionResult> {
  const user = await requireAdmin();
  if (!user) return { ok: false, error: "No autorizado." };

  const ocurrencia = await prisma.claseOcurrencia.findUnique({ where: { id: ocurrenciaId } });
  if (!ocurrencia) return { ok: false, error: "La clase no existe." };
  if (ocurrencia.estado !== "CANCELADA") return { ok: false, error: "Solo se puede volver a programar una clase que esté cancelada." };

  await prisma.claseOcurrencia.update({ where: { id: ocurrenciaId }, data: { estado: "PROGRAMADA" } });

  await registrarAuditoria({
    actorUserId: user.id, actorRole: user.role,
    action: "grilla.reprogramar_ocurrencia", entityType: "ClaseOcurrencia", entityId: ocurrenciaId,
  });

  return { ok: true };
}

// ---------------------------------------------------------------------------
// Horarios habituales (Alumna ↔ ClaseRecurrente)
// ---------------------------------------------------------------------------

/** Asigna un horario habitual respetando el cupo, con aislamiento serializable para que dos asignaciones simultáneas al último lugar nunca superen el cupo (sección 27). */
export async function asignarHorarioHabitualAction(alumnaId: string, claseRecurrenteId: string): Promise<ActionResult<{ id: string }>> {
  const user = await requireAdmin();
  if (!user) return { ok: false, error: "No autorizado." };

  const [alumna, clase] = await Promise.all([
    prisma.alumna.findUnique({ where: { id: alumnaId } }),
    prisma.claseRecurrente.findUnique({ where: { id: claseRecurrenteId } }),
  ]);
  if (!alumna) return { ok: false, error: "La alumna no existe." };
  if (!clase || !clase.activa) return { ok: false, error: "La clase no existe o ya no está activa." };

  const yaTiene = await prisma.horarioHabitual.findFirst({ where: { alumnaId, claseRecurrenteId, hasta: null } });
  if (yaTiene) return { ok: false, error: "La alumna ya tiene ese horario asignado." };

  try {
    const creado = await prisma.$transaction(
      async (tx) => {
        const ocupados = await tx.horarioHabitual.count({ where: { claseRecurrenteId, hasta: null } });
        if (ocupados >= clase.cupo) throw new Error("CUPO_COMPLETO");
        return tx.horarioHabitual.create({ data: { alumnaId, claseRecurrenteId, creadoPorUserId: user.id } });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    await registrarAuditoria({
      actorUserId: user.id, actorRole: user.role,
      action: "grilla.asignar_horario", entityType: "HorarioHabitual", entityId: creado.id,
      metadata: { alumnaId, claseRecurrenteId },
    });
    return { ok: true, id: creado.id };
  } catch (e) {
    if (e instanceof Error && e.message === "CUPO_COMPLETO") {
      return { ok: false, error: `Esa clase ya está completa (cupo ${clase.cupo}/${clase.cupo}).` };
    }
    return { ok: false, error: "No se pudo asignar el horario: puede haberse ocupado el último lugar justo ahora. Probá de nuevo." };
  }
}

export async function quitarHorarioHabitualAction(horarioHabitualId: string): Promise<ActionResult> {
  const user = await requireAdmin();
  if (!user) return { ok: false, error: "No autorizado." };

  const actual = await prisma.horarioHabitual.findUnique({ where: { id: horarioHabitualId } });
  if (!actual) return { ok: false, error: "El horario no existe." };
  if (actual.hasta !== null) return { ok: true };

  await prisma.horarioHabitual.update({ where: { id: horarioHabitualId }, data: { hasta: new Date() } });

  await registrarAuditoria({
    actorUserId: user.id, actorRole: user.role,
    action: "grilla.quitar_horario", entityType: "HorarioHabitual", entityId: horarioHabitualId,
    metadata: { alumnaId: actual.alumnaId, claseRecurrenteId: actual.claseRecurrenteId },
  });

  return { ok: true };
}

/** Cambiar = quitar el actual + asignar el nuevo en una sola operación atómica (si el nuevo no tiene lugar, el actual NO se toca). */
export async function cambiarHorarioHabitualAction(horarioHabitualId: string, nuevoClaseRecurrenteId: string): Promise<ActionResult<{ id: string }>> {
  const user = await requireAdmin();
  if (!user) return { ok: false, error: "No autorizado." };

  const actual = await prisma.horarioHabitual.findUnique({ where: { id: horarioHabitualId } });
  if (!actual || actual.hasta !== null) return { ok: false, error: "Ese horario ya no está vigente." };
  if (actual.claseRecurrenteId === nuevoClaseRecurrenteId) return { ok: false, error: "Es el mismo horario." };

  const nuevaClase = await prisma.claseRecurrente.findUnique({ where: { id: nuevoClaseRecurrenteId } });
  if (!nuevaClase || !nuevaClase.activa) return { ok: false, error: "La clase elegida no existe o ya no está activa." };

  try {
    const creado = await prisma.$transaction(
      async (tx) => {
        const ocupados = await tx.horarioHabitual.count({ where: { claseRecurrenteId: nuevoClaseRecurrenteId, hasta: null } });
        if (ocupados >= nuevaClase.cupo) throw new Error("CUPO_COMPLETO");
        await tx.horarioHabitual.update({ where: { id: horarioHabitualId }, data: { hasta: new Date() } });
        return tx.horarioHabitual.create({ data: { alumnaId: actual.alumnaId, claseRecurrenteId: nuevoClaseRecurrenteId, creadoPorUserId: user.id } });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    await registrarAuditoria({
      actorUserId: user.id, actorRole: user.role,
      action: "grilla.cambiar_horario", entityType: "HorarioHabitual", entityId: creado.id,
      metadata: { alumnaId: actual.alumnaId, anteriorClaseRecurrenteId: actual.claseRecurrenteId, nuevaClaseRecurrenteId: nuevoClaseRecurrenteId },
    });
    return { ok: true, id: creado.id };
  } catch (e) {
    if (e instanceof Error && e.message === "CUPO_COMPLETO") {
      return { ok: false, error: `La clase elegida ya está completa (cupo ${nuevaClase.cupo}/${nuevaClase.cupo}).` };
    }
    return { ok: false, error: "No se pudo cambiar el horario: puede haber cambiado algo justo ahora. Probá de nuevo." };
  }
}

// ---------------------------------------------------------------------------
// Consumo seguro de CompraPack — únicas funciones que tocan clasesTomadas/clasesRestantes.
// ---------------------------------------------------------------------------

async function elegirPackOFallar(tx: Tx, alumnaId: string) {
  const packs = await tx.compraPack.findMany({
    where: { alumnaId, estado: "ACTIVO", clasesRestantes: { gt: 0 } },
    select: { id: true, clasesRestantes: true },
  });
  const seleccion = seleccionarPackParaConsumo(packs);
  if (!seleccion.ok) throw new Error(seleccion.error satisfies ErrorSeleccionPack);
  return seleccion.pack;
}

async function consumirClase(tx: Tx, compraPackId: string) {
  const res = await tx.compraPack.updateMany({
    where: { id: compraPackId, clasesRestantes: { gt: 0 } },
    data: { clasesTomadas: { increment: 1 }, clasesRestantes: { decrement: 1 } },
  });
  if (res.count === 0) throw new Error("SIN_PACK_ACTIVO" satisfies ErrorSeleccionPack);
  const actualizado = await tx.compraPack.findUnique({ where: { id: compraPackId } });
  if (actualizado && actualizado.clasesRestantes === 0 && actualizado.estado === "ACTIVO") {
    await tx.compraPack.update({ where: { id: compraPackId }, data: { estado: "FINALIZADO" } });
  }
}

async function restaurarClase(tx: Tx, compraPackId: string) {
  const pack = await tx.compraPack.findUnique({ where: { id: compraPackId } });
  if (!pack) return;
  const nuevoEstado = pack.estado === "FINALIZADO" ? "ACTIVO" : pack.estado;
  await tx.compraPack.update({
    where: { id: compraPackId },
    data: { clasesTomadas: { decrement: 1 }, clasesRestantes: { increment: 1 }, estado: nuevoEstado },
  });
}

// ---------------------------------------------------------------------------
// Asistencia
// ---------------------------------------------------------------------------

export interface DatosAsistencia {
  estado: "PENDIENTE" | "PRESENTE" | "AUSENTE_CON_AVISO" | "AUSENTE_SIN_AVISO";
  /** Solo cuando estado = AUSENTE_CON_AVISO: valor crudo de un <input type="datetime-local">. */
  avisoFechaLocal?: string;
}

/**
 * Única función que marca o corrige asistencia (sección 12-22, 29). Siempre parte del estado
 * anterior: si tenía un consumo registrado, lo restaura antes de aplicar el nuevo; si tenía una
 * recuperación pendiente sin asignar, la anula. Así corregir nunca duplica ni pierde consumo.
 */
export async function tomarAsistenciaAction(alumnaId: string, claseOcurrenciaId: string, datos: DatosAsistencia): Promise<ActionResult> {
  const user = await requireAdmin();
  if (!user) return { ok: false, error: "No autorizado." };

  const ocurrencia = await prisma.claseOcurrencia.findUnique({ where: { id: claseOcurrenciaId }, include: { claseRecurrente: true } });
  if (!ocurrencia) return { ok: false, error: "La clase no existe." };
  if (ocurrencia.estado === "CANCELADA") return { ok: false, error: "Esta clase está cancelada: no se puede tomar asistencia." };

  const [habitual, existente] = await Promise.all([
    prisma.horarioHabitual.findFirst({
      where: { alumnaId, claseRecurrenteId: ocurrencia.claseRecurrenteId, desde: { lte: ocurrencia.fecha }, OR: [{ hasta: null }, { hasta: { gte: ocurrencia.fecha } }] },
    }),
    prisma.asistencia.findUnique({ where: { alumnaId_claseOcurrenciaId: { alumnaId, claseOcurrenciaId } } }),
  ]);
  if (!habitual && !existente) return { ok: false, error: "Esa alumna no tiene un lugar reservado en esta clase." };

  let avisoFecha: Date | null = null;
  if (datos.estado === "AUSENTE_CON_AVISO") {
    if (!datos.avisoFechaLocal) return { ok: false, error: "Ingresá la fecha y hora en que avisó." };
    avisoFecha = parseFechaHoraLocalArgentina(datos.avisoFechaLocal);
    if (!avisoFecha) return { ok: false, error: "La fecha y hora del aviso no son válidas." };
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        if (existente?.compraPackConsumidoId) {
          await restaurarClase(tx, existente.compraPackConsumidoId);
        }
        if (existente) {
          const recuperacionPrevia = await tx.recuperacion.findUnique({ where: { asistenciaOrigenId: existente.id } });
          if (recuperacionPrevia) {
            if (recuperacionPrevia.claseOcurrenciaDestinoId) throw new Error("RECUPERACION_YA_ASIGNADA");
            await tx.recuperacion.delete({ where: { id: recuperacionPrevia.id } });
          }
        }

        let compraPackConsumidoId: string | null = null;
        let avisoValido: boolean | null = null;

        if (datos.estado === "PRESENTE" || datos.estado === "AUSENTE_SIN_AVISO") {
          const pack = await elegirPackOFallar(tx, alumnaId);
          await consumirClase(tx, pack.id);
          compraPackConsumidoId = pack.id;
        } else if (datos.estado === "AUSENTE_CON_AVISO") {
          avisoValido = avisoEsValido(ocurrencia.fecha, ocurrencia.claseRecurrente.hora, avisoFecha!);
          if (!avisoValido) {
            const pack = await elegirPackOFallar(tx, alumnaId);
            await consumirClase(tx, pack.id);
            compraPackConsumidoId = pack.id;
          }
        }

        const asistencia = await tx.asistencia.upsert({
          where: { alumnaId_claseOcurrenciaId: { alumnaId, claseOcurrenciaId } },
          create: {
            alumnaId, claseOcurrenciaId,
            tipoReserva: existente?.tipoReserva ?? "HABITUAL",
            horarioHabitualId: existente?.horarioHabitualId ?? habitual?.id ?? null,
            estado: datos.estado, avisoFecha, avisoValido, compraPackConsumidoId,
          },
          update: { estado: datos.estado, avisoFecha, avisoValido, compraPackConsumidoId },
        });

        if (datos.estado === "AUSENTE_CON_AVISO" && avisoValido) {
          const pack = await elegirPackOFallar(tx, alumnaId); // se fija (sin consumir) qué pack queda en juego
          await tx.recuperacion.create({
            data: {
              alumnaId,
              asistenciaOrigenId: asistencia.id,
              compraPackId: pack.id,
              fechaLimite: calcularFechaLimiteRecuperacion(ocurrencia.fecha, DIAS_VIGENCIA_RECUPERACION),
              estado: "PENDIENTE",
            },
          });
        }
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (e) {
    if (e instanceof Error && e.message === "RECUPERACION_YA_ASIGNADA") {
      return { ok: false, error: "Esta ausencia ya generó una recuperación asignada a una clase: no se puede corregir directamente." };
    }
    if (e instanceof Error && e.message in MENSAJE_ERROR_PACK) {
      return { ok: false, error: MENSAJE_ERROR_PACK[e.message as ErrorSeleccionPack] };
    }
    return { ok: false, error: "No se pudo guardar la asistencia: puede haber cambiado algo justo ahora. Probá de nuevo." };
  }

  await registrarAuditoria({
    actorUserId: user.id, actorRole: user.role,
    action: "grilla.tomar_asistencia", entityType: "Asistencia", entityId: claseOcurrenciaId,
    metadata: { alumnaId, claseOcurrenciaId, estadoAnterior: existente?.estado ?? "PENDIENTE", estadoNuevo: datos.estado },
  });

  return { ok: true };
}
