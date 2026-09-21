// Datos MOCK de la ficha individual de alumna (Admin > Alumnos > [alumna]).
//
// Importante: por ahora la ficha usa SOLO lo que ya existe en el proyecto (plan, importes, estado de
// la cuota, medios de pago, clases y horarios). No define reglas nuevas de pagos, recuperaciones ni
// cancelaciones: eso se va a relevar con la dueña. Los datos de asistencia son de ejemplo.
// Las clases de la alumna salen de la lista de clases del Admin (lib/data/clasesAdmin.ts).

import type { Alumna, EstadoPago, MedioDePago } from "./admin";

// ---- Asistencia (datos de ejemplo) ----
export interface Asistencia {
  programadas: number;
  asistio: number;
  ausencias: number;
  porcentaje: number;
}

/** Resumen de las últimas 4 semanas. Solo cuenta asistencias y ausencias. */
export function asistenciaDe(a: Alumna): Asistencia {
  // Una alumna recién dada de alta todavía no tiene asistencias registradas.
  if (a.altaManual) return { programadas: 0, asistio: 0, ausencias: 0, porcentaje: 0 };
  const programadas = a.clasesPorSemana * 4;
  const ausencias = a.id % 4 === 0 ? 2 : a.id % 3 === 0 ? 1 : 0;
  const asistio = programadas - ausencias;
  return { programadas, asistio, ausencias, porcentaje: Math.round((asistio / programadas) * 100) };
}

// ---- Historial de pagos ----
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

/** Meses completos desde el alta ("Marzo 2026") hasta hoy. */
export function antiguedadEnMeses(desde: string, ahora = new Date()): number {
  const [mes, anio] = desde.toLowerCase().split(" ");
  const indice = MESES.indexOf(mes);
  if (indice < 0 || Number.isNaN(Number(anio))) return 0;
  return Math.max(0, (ahora.getFullYear() - Number(anio)) * 12 + (ahora.getMonth() - indice));
}

export interface PagoHistorial {
  /** 0 = mes actual, 1 = mes anterior, … */
  mesesAtras: number;
  /** Hace cuántos días se registró */
  hace: number;
  monto: number;
  medio: MedioDePago;
  estado: EstadoPago;
  /** true = todavía no se registró ningún pago (no hay fecha que mostrar) */
  sinFecha?: boolean;
}

/** Últimos pagos (hasta 6 meses, sin pasar del mes de alta). Mismo plan e importe que el actual. */
export function historialDe(a: Alumna): PagoHistorial[] {
  const meses = Math.min(6, antiguedadEnMeses(a.desde) + 1);
  return Array.from({ length: meses }, (_, k) => ({
    mesesAtras: k,
    hace: k === 0 ? a.hace : a.hace + 30 * k,
    monto: a.monto,
    medio: a.medio,
    estado: k === 0 ? a.estado : "Aprobado",
    sinFecha: k === 0 && Boolean(a.altaManual),
  }));
}
