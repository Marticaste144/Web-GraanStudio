// Datos MOCK de la ficha individual de alumna (Admin > Alumnos > [alumna]).
//
// Importante: por ahora la ficha usa SOLO lo que ya existe en el proyecto (plan, importes, estado de
// la cuota, medios de pago, clases y horarios). No define reglas nuevas de pagos, recuperaciones ni
// cancelaciones: eso se va a relevar con la dueña. Los datos de asistencia son de ejemplo.

import { ALUMNAS, SOFIA_ID, type Alumna, type EstadoPago, type MedioDePago } from "./admin";
import { CLASES_DE_ALUMNA } from "./alumna";
import { clasesDelDia, DIAS, TODAS_LAS_CLASES, type Clase } from "./horarios";

export const getAlumna = (id: number): Alumna | undefined => ALUMNAS.find((a) => a.id === id);

// ---- Clases en las que está anotada ----
/**
 * Sofía usa sus 3 clases reales (las mismas que ve en el portal). Para el resto se reparten
 * tantas clases como indique su plan, en días distintos de la semana, siempre sobre horarios que existen.
 */
export function clasesDeAlumna(a: Alumna): Clase[] {
  if (a.id === SOFIA_ID) {
    return CLASES_DE_ALUMNA.flatMap((c) => TODAS_LAS_CLASES.filter((x) => x.dia === c.dia && x.hora === c.hora));
  }
  const inicio = a.id % 5;
  const elegidas = Array.from({ length: a.clasesPorSemana }, (_, k) => {
    const dia = DIAS[(inicio + 2 * k) % 5].id;
    const delDia = clasesDelDia(dia);
    return delDia[(a.id * 7 + k * 3) % delDia.length];
  });
  const orden = (c: Clase) => DIAS.findIndex((d) => d.id === c.dia) * 100 + parseInt(c.hora);
  return elegidas.sort((x, y) => orden(x) - orden(y));
}

// ---- Asistencia (datos de ejemplo) ----
export interface Asistencia {
  programadas: number;
  asistio: number;
  ausencias: number;
  porcentaje: number;
}

/** Resumen de las últimas 4 semanas. Solo cuenta asistencias y ausencias. */
export function asistenciaDe(a: Alumna): Asistencia {
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
  }));
}
