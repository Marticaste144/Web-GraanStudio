// Aritmética de fechas para la grilla semanal. Todas las fechas de ClaseOcurrencia se guardan como
// medianoche UTC (mismo criterio que CompraPack.fechaInicio) para que comparar por fecha sea
// siempre exacto sin depender de la zona horaria del servidor.

import type { Dia } from "@/lib/data/horarios";

export const DIAS_SEMANA: Dia[] = ["lunes", "martes", "miercoles", "jueves", "viernes"];

const UN_DIA_MS = 24 * 60 * 60 * 1000;

/** Medianoche UTC del día recibido (sin hora). */
export function medianocheUTC(fecha: Date): Date {
  return new Date(Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate()));
}

/** Lunes (medianoche UTC) de la semana que contiene `fecha`. */
export function inicioSemana(fecha: Date): Date {
  const d = medianocheUTC(fecha);
  const diaSemana = d.getUTCDay(); // 0=domingo .. 6=sábado
  const offset = diaSemana === 0 ? -6 : 1 - diaSemana;
  return new Date(d.getTime() + offset * UN_DIA_MS);
}

/** Las 5 fechas (lunes a viernes) de la semana que empieza en `lunes`. */
export function diasDeSemana(lunes: Date): Date[] {
  return Array.from({ length: 5 }, (_, i) => new Date(lunes.getTime() + i * UN_DIA_MS));
}

export function sumarDias(fecha: Date, dias: number): Date {
  return new Date(fecha.getTime() + dias * UN_DIA_MS);
}

export function mismaFecha(a: Date, b: Date): boolean {
  return medianocheUTC(a).getTime() === medianocheUTC(b).getTime();
}

/**
 * Graan Studio opera en horario de Argentina (UTC-3, sin horario de verano desde 2009: el offset
 * es fijo todo el año). ClaseRecurrente.hora ("HH:MM") es siempre hora local de Buenos Aires.
 * Se resuelve el offset acá explícitamente en vez de confiar en la zona horaria del servidor
 * (que en producción puede correr en UTC), así el cálculo de las 3 horas de anticipación es
 * siempre correcto sin importar dónde se ejecute el proceso.
 */
const OFFSET_ARGENTINA = "-03:00";

/** Combina la fecha (medianoche UTC) de una ocurrencia con su hora "HH:MM" (hora Argentina) en un instante real. */
export function fechaHoraClase(fecha: Date, hora: string): Date {
  const f = medianocheUTC(fecha);
  const fechaISO = `${f.getUTCFullYear()}-${String(f.getUTCMonth() + 1).padStart(2, "0")}-${String(f.getUTCDate()).padStart(2, "0")}`;
  return new Date(`${fechaISO}T${hora}:00${OFFSET_ARGENTINA}`);
}

/**
 * Parsea el valor crudo de un <input type="datetime-local"> (sin zona horaria, ej. "2026-09-23T15:00")
 * como hora de Argentina, para que sea comparable con `fechaHoraClase`.
 */
export function parseFechaHoraLocalArgentina(valor: string): Date | null {
  const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/.exec(valor);
  if (!m) return null;
  const d = new Date(`${m[1]}T${m[2]}:00${OFFSET_ARGENTINA}`);
  return isNaN(d.getTime()) ? null : d;
}
