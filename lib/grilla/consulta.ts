import "server-only";

// Lectura de la grilla semanal y el detalle de una ocurrencia. Ambas combinan, para cada
// ClaseOcurrencia: (a) las alumnas con HorarioHabitual vigente a esa fecha ("lugar reservado",
// sección 2-3, calculado dinámicamente — nunca se materializa una fila por cada lugar habitual: así
// un horario agregado o quitado después de generar la ocurrencia se refleja igual, sin backfill)
// con (b) las filas de Asistencia que ya se hayan registrado para esa ocurrencia puntual.

import { prisma } from "@/lib/prisma";
import type { Dia } from "@/lib/data/horarios";
import { calcularDisponibilidad, type DisponibilidadOcurrencia } from "./calculos";
import { diasDeSemana } from "./semana";

export interface OcurrenciaResumen {
  id: string;
  fecha: Date;
  dia: Dia;
  hora: string;
  disciplinaNombre: string;
  profesoraProgramadaNombre: string;
  profesoraRealNombre: string | null;
  estado: string;
  disponibilidad: DisponibilidadOcurrencia;
}

export interface LugarOcurrencia {
  alumnaId: string;
  nombre: string;
  apellido: string;
  tipoReserva: "HABITUAL" | "RECUPERACION";
  horarioHabitualId: string | null;
  asistenciaId: string | null;
  estado: "PENDIENTE" | "PRESENTE" | "AUSENTE_CON_AVISO" | "AUSENTE_SIN_AVISO";
  avisoFecha: Date | null;
  avisoValido: boolean | null;
}

export interface OcurrenciaDetalle extends OcurrenciaResumen {
  claseRecurrenteId: string;
  profesoraProgramadaId: string;
  profesoraRealId: string | null;
  cupoMaximo: number;
  lugares: LugarOcurrencia[];
}

/** Trae (o crea si hiciera falta más adelante) las 5 ocurrencias lunes-viernes de cada ClaseRecurrente para esa semana, con su disponibilidad ya calculada. */
export async function semanaGrilla(lunes: Date): Promise<Record<Dia, OcurrenciaResumen[]>> {
  const dias = diasDeSemana(lunes);
  const desde = dias[0];
  const hasta = dias[dias.length - 1];

  const ocurrencias = await prisma.claseOcurrencia.findMany({
    where: { fecha: { gte: desde, lte: hasta } },
    include: {
      claseRecurrente: { include: { disciplina: true, profesora: true } },
      profesoraReal: true,
    },
    orderBy: [{ fecha: "asc" }, { claseRecurrente: { hora: "asc" } }],
  });

  const claseRecurrenteIds = [...new Set(ocurrencias.map((o) => o.claseRecurrenteId))];
  const ocurrenciaIds = ocurrencias.map((o) => o.id);

  const [habituales, asistencias] = await Promise.all([
    prisma.horarioHabitual.findMany({
      where: { claseRecurrenteId: { in: claseRecurrenteIds } },
      select: { claseRecurrenteId: true, alumnaId: true, desde: true, hasta: true },
    }),
    prisma.asistencia.findMany({
      where: { claseOcurrenciaId: { in: ocurrenciaIds } },
      select: { claseOcurrenciaId: true, alumnaId: true, tipoReserva: true, estado: true },
    }),
  ]);

  const asistPorOcurrencia = new Map<string, typeof asistencias>();
  for (const a of asistencias) {
    const lista = asistPorOcurrencia.get(a.claseOcurrenciaId) ?? [];
    lista.push(a);
    asistPorOcurrencia.set(a.claseOcurrenciaId, lista);
  }

  const resultado: Record<Dia, OcurrenciaResumen[]> = { lunes: [], martes: [], miercoles: [], jueves: [], viernes: [] };

  for (const o of ocurrencias) {
    const habitualesDeClase = habituales.filter(
      (h) => h.claseRecurrenteId === o.claseRecurrenteId && h.desde <= o.fecha && (h.hasta === null || h.hasta >= o.fecha),
    );
    const asistenciasDeOcurrencia = asistPorOcurrencia.get(o.id) ?? [];
    const asistPorAlumna = new Map(asistenciasDeOcurrencia.map((a) => [a.alumnaId, a]));

    const ausentesConfirmadas = habitualesDeClase.filter((h) => {
      const est = asistPorAlumna.get(h.alumnaId)?.estado;
      return est === "AUSENTE_CON_AVISO" || est === "AUSENTE_SIN_AVISO";
    }).length;
    const recuperacionesAsignadas = asistenciasDeOcurrencia.filter((a) => a.tipoReserva === "RECUPERACION").length;

    resultado[o.claseRecurrente.dia as Dia].push({
      id: o.id,
      fecha: o.fecha,
      dia: o.claseRecurrente.dia as Dia,
      hora: o.claseRecurrente.hora,
      disciplinaNombre: o.claseRecurrente.disciplina.nombre,
      profesoraProgramadaNombre: o.claseRecurrente.profesora.nombre,
      profesoraRealNombre: o.profesoraReal?.nombre ?? null,
      estado: o.estado,
      disponibilidad: calcularDisponibilidad({
        cupoMaximo: o.claseRecurrente.cupo,
        habituales: habitualesDeClase.length,
        ausentesConfirmadas,
        recuperacionesAsignadas,
      }),
    });
  }

  return resultado;
}

export async function detalleOcurrencia(id: string): Promise<OcurrenciaDetalle | null> {
  const o = await prisma.claseOcurrencia.findUnique({
    where: { id },
    include: { claseRecurrente: { include: { disciplina: true, profesora: true } }, profesoraReal: true },
  });
  if (!o) return null;

  const [habituales, asistencias] = await Promise.all([
    prisma.horarioHabitual.findMany({
      where: { claseRecurrenteId: o.claseRecurrenteId, desde: { lte: o.fecha }, OR: [{ hasta: null }, { hasta: { gte: o.fecha } }] },
      include: { alumna: { select: { id: true, nombre: true, apellido: true } } },
    }),
    prisma.asistencia.findMany({
      where: { claseOcurrenciaId: id },
      include: { alumna: { select: { id: true, nombre: true, apellido: true } } },
    }),
  ]);

  const asistPorAlumna = new Map(asistencias.map((a) => [a.alumnaId, a]));

  const lugaresHabituales: LugarOcurrencia[] = habituales.map((h) => {
    const a = asistPorAlumna.get(h.alumnaId);
    return {
      alumnaId: h.alumnaId,
      nombre: h.alumna.nombre,
      apellido: h.alumna.apellido,
      tipoReserva: "HABITUAL",
      horarioHabitualId: h.id,
      asistenciaId: a?.id ?? null,
      estado: (a?.estado as LugarOcurrencia["estado"]) ?? "PENDIENTE",
      avisoFecha: a?.avisoFecha ?? null,
      avisoValido: a?.avisoValido ?? null,
    };
  });

  const lugaresRecuperacion: LugarOcurrencia[] = asistencias
    .filter((a) => a.tipoReserva === "RECUPERACION")
    .map((a) => ({
      alumnaId: a.alumnaId,
      nombre: a.alumna.nombre,
      apellido: a.alumna.apellido,
      tipoReserva: "RECUPERACION",
      horarioHabitualId: null,
      asistenciaId: a.id,
      estado: a.estado as LugarOcurrencia["estado"],
      avisoFecha: a.avisoFecha,
      avisoValido: a.avisoValido,
    }));

  const ausentesConfirmadas = lugaresHabituales.filter((l) => l.estado === "AUSENTE_CON_AVISO" || l.estado === "AUSENTE_SIN_AVISO").length;

  return {
    id: o.id,
    fecha: o.fecha,
    dia: o.claseRecurrente.dia as Dia,
    hora: o.claseRecurrente.hora,
    disciplinaNombre: o.claseRecurrente.disciplina.nombre,
    profesoraProgramadaNombre: o.claseRecurrente.profesora.nombre,
    profesoraRealNombre: o.profesoraReal?.nombre ?? null,
    estado: o.estado,
    claseRecurrenteId: o.claseRecurrenteId,
    profesoraProgramadaId: o.claseRecurrente.profesoraId,
    profesoraRealId: o.profesoraRealId,
    cupoMaximo: o.claseRecurrente.cupo,
    lugares: [...lugaresHabituales, ...lugaresRecuperacion],
    disponibilidad: calcularDisponibilidad({
      cupoMaximo: o.claseRecurrente.cupo,
      habituales: lugaresHabituales.length,
      ausentesConfirmadas,
      recuperacionesAsignadas: lugaresRecuperacion.length,
    }),
  };
}

/** Cuántas alumnas tienen HorarioHabitual vigente (hasta=null) para esa ClaseRecurrente hoy. Usado para el cupo al asignar un nuevo horario. */
export async function contarHabitualesVigentes(claseRecurrenteId: string): Promise<number> {
  return prisma.horarioHabitual.count({ where: { claseRecurrenteId, hasta: null } });
}

export interface HorarioHabitualFicha {
  id: string;
  claseRecurrenteId: string;
  dia: Dia;
  hora: string;
  disciplinaNombre: string;
  profesoraNombre: string;
  desde: Date;
}

/** Horarios habituales VIGENTES de una alumna (hasta=null), para la sección de su ficha. */
export async function horariosVigentesDeAlumna(alumnaId: string): Promise<HorarioHabitualFicha[]> {
  const filas = await prisma.horarioHabitual.findMany({
    where: { alumnaId, hasta: null },
    include: { claseRecurrente: { include: { disciplina: true, profesora: true } } },
    orderBy: [{ claseRecurrente: { dia: "asc" } }, { claseRecurrente: { hora: "asc" } }],
  });
  return filas.map((h) => ({
    id: h.id,
    claseRecurrenteId: h.claseRecurrenteId,
    dia: h.claseRecurrente.dia as Dia,
    hora: h.claseRecurrente.hora,
    disciplinaNombre: h.claseRecurrente.disciplina.nombre,
    profesoraNombre: h.claseRecurrente.profesora.nombre,
    desde: h.desde,
  }));
}

export interface ClaseRecurrenteOpcion {
  id: string;
  dia: Dia;
  hora: string;
  disciplinaNombre: string;
  profesoraNombre: string;
  cupo: number;
  ocupacion: number;
}

/** Todas las ClaseRecurrente activas con su ocupación habitual actual (para el selector de "Agregar horario"). */
export async function clasesRecurrentesConOcupacion(): Promise<ClaseRecurrenteOpcion[]> {
  const [clases, ocupaciones] = await Promise.all([
    prisma.claseRecurrente.findMany({
      where: { activa: true },
      include: { disciplina: true, profesora: true },
      orderBy: [{ dia: "asc" }, { hora: "asc" }],
    }),
    prisma.horarioHabitual.groupBy({ by: ["claseRecurrenteId"], where: { hasta: null }, _count: true }),
  ]);
  const ocupacionPorClase = new Map(ocupaciones.map((o) => [o.claseRecurrenteId, o._count]));
  return clases.map((c) => ({
    id: c.id,
    dia: c.dia as Dia,
    hora: c.hora,
    disciplinaNombre: c.disciplina.nombre,
    profesoraNombre: c.profesora.nombre,
    cupo: c.cupo,
    ocupacion: ocupacionPorClase.get(c.id) ?? 0,
  }));
}
