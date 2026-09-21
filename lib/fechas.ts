// Utilidades de fecha para el demo. Siempre en hora de Buenos Aires.

import { DIAS, type Dia } from "./data/horarios";

const TZ = "America/Argentina/Buenos_Aires";

const sinTildes = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "");

const capitalizar = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export interface DiaDemo {
  dia: Dia;
  /** Etiqueta para mostrar: "Lunes 21 de septiembre" o solo "Lunes" si el día está forzado. */
  etiqueta: string;
  /** Hora actual (0–23). Es 0 cuando el día es "de demostración" (forzado o fin de semana). */
  hora: number;
}

/**
 * Día que usa el demo para "hoy".
 * - Si viene ?dia=martes (etc.) en la URL, se usa ese: sirve para mostrar cualquier día en vivo.
 * - Si no, el día real (de lunes a viernes).
 * - Si hoy es fin de semana (el estudio no abre), se usa el lunes para que el demo no quede vacío.
 */
export function resolverDia(param?: string | string[]): DiaDemo {
  const forzado = (Array.isArray(param) ? param[0] : param)?.toLowerCase();
  const encontrado = DIAS.find((d) => d.id === sinTildes(forzado ?? ""));
  if (encontrado) return { dia: encontrado.id, etiqueta: encontrado.nombre, hora: 0 };

  const ahora = new Date();
  const nombre = sinTildes(
    new Intl.DateTimeFormat("es-AR", { weekday: "long", timeZone: TZ }).format(ahora),
  );
  const real = DIAS.find((d) => d.id === nombre);
  if (!real) return { dia: "lunes", etiqueta: "Lunes", hora: 0 };

  const fecha = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: TZ,
  }).format(ahora);
  const hora = Number(
    new Intl.DateTimeFormat("es-AR", { hour: "numeric", hourCycle: "h23", timeZone: TZ }).format(ahora),
  );
  return { dia: real.id, etiqueta: capitalizar(fecha), hora };
}

/** Mes actual en texto, ej: "Septiembre 2026". */
export function mesActual(): string {
  const s = new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
    timeZone: TZ,
  }).format(new Date());
  return capitalizar(s.replace(" de ", " "));
}

/** Nombres cortos de los últimos `n` meses (el último es el actual), ej: ["Abr", …, "Sep"]. */
export function ultimosMeses(n: number): string[] {
  const base = new Date();
  return Array.from({ length: n }, (_, k) => {
    const d = new Date(base.getFullYear(), base.getMonth() - (n - 1 - k), 15);
    const corto = new Intl.DateTimeFormat("es-AR", { month: "short", timeZone: TZ }).format(d);
    return capitalizar(corto.replace(".", ""));
  });
}

/** Fecha a N días desde hoy (N puede ser negativo), ej: "25 de septiembre". */
export function fechaEnDias(n: number): string {
  const d = new Date(Date.now() + n * 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    timeZone: TZ,
  }).format(d);
}

/** Fecha corta a N días desde hoy (N puede ser negativo), ej: "17 sep". */
export function fechaCortaEnDias(n: number): string {
  const d = new Date(Date.now() + n * 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", timeZone: TZ })
    .format(d)
    .replace(".", "");
}
