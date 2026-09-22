"use server";

// Server Actions para gestionar ClaseRecurrente (Bloque 2). Solo la estructura operativa de la
// grilla semanal: todavía no hay asignación de alumnas ni generación de ClaseOcurrencia acá.

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import { can } from "@/lib/auth/rbac";
import { registrarAuditoria } from "@/lib/audit";

type ActionResult<T = object> = ({ ok: true } & T) | { ok: false; error: string };

const DIAS_VALIDOS = ["lunes", "martes", "miercoles", "jueves", "viernes"] as const;
const HORAS_VALIDAS = Array.from({ length: 12 }, (_, i) => `${String(8 + i).padStart(2, "0")}:00`);

export interface DatosClaseRecurrente {
  disciplinaId: string;
  profesoraId: string;
  dia: string;
  hora: string;
  cupo: number;
}

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "admin:access")) return null;
  return user;
}

function validar(datos: DatosClaseRecurrente): string | null {
  if (!DIAS_VALIDOS.includes(datos.dia as (typeof DIAS_VALIDOS)[number])) return "Elegí un día válido.";
  if (!HORAS_VALIDAS.includes(datos.hora)) return "Elegí un horario válido.";
  if (!Number.isInteger(datos.cupo) || datos.cupo < 1) return "El cupo máximo tiene que ser un número de 1 o más.";
  if (!datos.disciplinaId) return "Elegí una disciplina.";
  if (!datos.profesoraId) return "Elegí una profesora.";
  return null;
}

export async function crearClaseRecurrenteAction(datos: DatosClaseRecurrente): Promise<ActionResult<{ id: string }>> {
  const user = await requireAdmin();
  if (!user) return { ok: false, error: "No autorizado." };

  const errorValidacion = validar(datos);
  if (errorValidacion) return { ok: false, error: errorValidacion };

  const [disciplina, profesora] = await Promise.all([
    prisma.disciplina.findUnique({ where: { id: datos.disciplinaId } }),
    prisma.profesora.findUnique({ where: { id: datos.profesoraId } }),
  ]);
  if (!disciplina) return { ok: false, error: "La disciplina elegida no existe." };
  if (disciplina.aConsulta) return { ok: false, error: `"${disciplina.nombre}" todavía no tiene horario fijo (es a consultar).` };
  if (!profesora || !profesora.activa) return { ok: false, error: "La profesora elegida no existe o está inactiva." };

  const ocupado = await prisma.claseRecurrente.findUnique({
    where: { dia_hora: { dia: datos.dia, hora: datos.hora } },
  });
  if (ocupado && ocupado.activa) {
    return { ok: false, error: `Ya hay una clase ese día a las ${datos.hora}. Elegí otro día u horario.` };
  }

  // Si existía una clase inactiva (dada de baja) en ese mismo día+hora, se reactiva con los datos nuevos
  // en vez de violar la restricción única de (dia, hora).
  const clase = ocupado
    ? await prisma.claseRecurrente.update({
        where: { id: ocupado.id },
        data: { disciplinaId: datos.disciplinaId, profesoraId: datos.profesoraId, cupo: datos.cupo, activa: true },
      })
    : await prisma.claseRecurrente.create({
        data: {
          disciplinaId: datos.disciplinaId,
          profesoraId: datos.profesoraId,
          dia: datos.dia,
          hora: datos.hora,
          cupo: datos.cupo,
        },
      });

  await registrarAuditoria({
    actorUserId: user.id,
    actorRole: user.role,
    action: "clases.crear",
    entityType: "ClaseRecurrente",
    entityId: clase.id,
    metadata: { dia: clase.dia, hora: clase.hora, disciplina: disciplina.nombre, profesora: profesora.nombre },
  });

  return { ok: true, id: clase.id };
}

export async function editarClaseRecurrenteAction(id: string, datos: DatosClaseRecurrente): Promise<ActionResult> {
  const user = await requireAdmin();
  if (!user) return { ok: false, error: "No autorizado." };

  const errorValidacion = validar(datos);
  if (errorValidacion) return { ok: false, error: errorValidacion };

  const actual = await prisma.claseRecurrente.findUnique({ where: { id } });
  if (!actual || !actual.activa) return { ok: false, error: "La clase ya no existe." };

  const [disciplina, profesora] = await Promise.all([
    prisma.disciplina.findUnique({ where: { id: datos.disciplinaId } }),
    prisma.profesora.findUnique({ where: { id: datos.profesoraId } }),
  ]);
  if (!disciplina) return { ok: false, error: "La disciplina elegida no existe." };
  if (disciplina.aConsulta) return { ok: false, error: `"${disciplina.nombre}" todavía no tiene horario fijo (es a consultar).` };
  if (!profesora || !profesora.activa) return { ok: false, error: "La profesora elegida no existe o está inactiva." };

  const enElMismoLugar = await prisma.claseRecurrente.findUnique({
    where: { dia_hora: { dia: datos.dia, hora: datos.hora } },
  });
  if (enElMismoLugar && enElMismoLugar.id !== id && enElMismoLugar.activa) {
    return { ok: false, error: `Ya hay una clase ese día a las ${datos.hora}. Elegí otro día u horario.` };
  }

  await prisma.claseRecurrente.update({
    where: { id },
    data: { disciplinaId: datos.disciplinaId, profesoraId: datos.profesoraId, dia: datos.dia, hora: datos.hora, cupo: datos.cupo },
  });

  await registrarAuditoria({
    actorUserId: user.id,
    actorRole: user.role,
    action: "clases.editar",
    entityType: "ClaseRecurrente",
    entityId: id,
    metadata: { dia: datos.dia, hora: datos.hora, disciplina: disciplina.nombre, profesora: profesora.nombre },
  });

  return { ok: true };
}

/** Baja lógica (activa=false): preserva la fila para no perder historial de ocurrencias futuras. */
export async function eliminarClaseRecurrenteAction(id: string): Promise<ActionResult> {
  const user = await requireAdmin();
  if (!user) return { ok: false, error: "No autorizado." };

  const actual = await prisma.claseRecurrente.findUnique({ where: { id } });
  if (!actual || !actual.activa) return { ok: false, error: "La clase ya no existe." };

  await prisma.claseRecurrente.update({ where: { id }, data: { activa: false } });

  await registrarAuditoria({
    actorUserId: user.id,
    actorRole: user.role,
    action: "clases.eliminar",
    entityType: "ClaseRecurrente",
    entityId: id,
    metadata: { dia: actual.dia, hora: actual.hora },
  });

  return { ok: true };
}
