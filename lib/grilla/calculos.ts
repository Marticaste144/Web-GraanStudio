// Única fuente de verdad para: disponibilidad de una ocurrencia, selección segura del CompraPack a
// descontar, y validación del aviso de ausencia. Bloque 6 (recuperaciones) reutiliza directamente
// calcularDisponibilidad para "buscar lugares disponibles entre fecha X e Y" (sección 6 y 25).

import { fechaHoraClase } from "./semana";
import { MINUTOS_AVISO_MINIMO } from "./config";

export interface DisponibilidadOcurrencia {
  cupoMaximo: number;
  /** Alumnas con HorarioHabitual vigente para esa fecha (antes de descontar ausencias). */
  habituales: number;
  /** De esas habituales, cuántas avisaron ausencia confirmada para ESTA fecha puntual. */
  ausentesConfirmadas: number;
  /** Recuperaciones ya asignadas a esta ocurrencia (Bloque 6: siempre 0 en Bloque 5). */
  recuperacionesAsignadas: number;
  /** Lugares nunca ocupados por una reserva habitual (cupoMaximo - habituales). */
  lugaresNormales: number;
  /** Lugares de alumnas habituales que liberaron su lugar SOLO para esta fecha. */
  lugaresLiberados: number;
  /** Ocupación real de la clase (nunca negativa, nunca mayor al cupo). */
  ocupacionEfectiva: number;
  /** lugaresNormales + lugaresLiberados: total de lugares utilizables en esta ocurrencia puntual. */
  disponibilidadTotal: number;
}

export function calcularDisponibilidad(params: {
  cupoMaximo: number;
  habituales: number;
  ausentesConfirmadas: number;
  recuperacionesAsignadas?: number;
}): DisponibilidadOcurrencia {
  const { cupoMaximo, habituales, ausentesConfirmadas } = params;
  const recuperacionesAsignadas = params.recuperacionesAsignadas ?? 0;

  const lugaresNormales = Math.max(0, cupoMaximo - habituales);
  // Un lugar liberado por ausencia deja de estar libre en cuanto una recuperación lo ocupa.
  const lugaresLiberados = Math.max(0, ausentesConfirmadas - recuperacionesAsignadas);
  const ocupacionEfectiva = Math.min(cupoMaximo, Math.max(0, habituales - ausentesConfirmadas + recuperacionesAsignadas));

  return {
    cupoMaximo,
    habituales,
    ausentesConfirmadas,
    recuperacionesAsignadas,
    lugaresNormales,
    lugaresLiberados,
    ocupacionEfectiva,
    disponibilidadTotal: lugaresNormales + lugaresLiberados,
  };
}

/**
 * ¿El aviso de ausencia llegó con el mínimo de anticipación exigido (3 horas, sección 16)?
 * Exactamente 3 horas antes es válido. Nunca se confía en un cálculo hecho en el frontend.
 */
export function avisoEsValido(fechaOcurrencia: Date, horaClase: string, avisoFecha: Date): boolean {
  const claseInstante = fechaHoraClase(fechaOcurrencia, horaClase);
  const minutosAnticipacion = (claseInstante.getTime() - avisoFecha.getTime()) / 60000;
  return minutosAnticipacion >= MINUTOS_AVISO_MINIMO;
}

/**
 * Fecha límite para recuperar: fecha de la clase original + 7 días, inclusive (mismo día de la
 * semana siguiente). Nunca se calcula desde la fecha en que Administración carga la ausencia.
 */
export function calcularFechaLimiteRecuperacion(fechaOcurrenciaOriginal: Date, diasVigencia: number): Date {
  return new Date(fechaOcurrenciaOriginal.getTime() + diasVigencia * 24 * 60 * 60 * 1000);
}

export type ErrorSeleccionPack = "SIN_PACK_ACTIVO" | "PACK_AMBIGUO";

export interface CompraPackElegible {
  id: string;
  clasesRestantes: number;
}

/**
 * Regla de la sección 30: la asistencia debe consumir un CompraPack válido y sin ambigüedad. Si la
 * alumna no tiene ningún pack ACTIVO con clases restantes, o tiene más de uno, NO se elige
 * arbitrariamente "el último": se devuelve un error claro para que Administración lo resuelva.
 */
export function seleccionarPackParaConsumo(
  packsActivosConClases: CompraPackElegible[],
): { ok: true; pack: CompraPackElegible } | { ok: false; error: ErrorSeleccionPack } {
  if (packsActivosConClases.length === 0) return { ok: false, error: "SIN_PACK_ACTIVO" };
  if (packsActivosConClases.length > 1) return { ok: false, error: "PACK_AMBIGUO" };
  return { ok: true, pack: packsActivosConClases[0] };
}

export const MENSAJE_ERROR_PACK: Record<ErrorSeleccionPack, string> = {
  SIN_PACK_ACTIVO: "La alumna no tiene un pack activo con clases disponibles. No se puede registrar el consumo.",
  PACK_AMBIGUO: "La alumna tiene más de un pack activo con clases disponibles: no se puede elegir automáticamente cuál descontar. Resolvé la situación de sus packs antes de tomar asistencia (por ejemplo, finalizando el que no corresponda).",
};
