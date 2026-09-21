// Alumna de ejemplo para la vista de alumno (todo mock, sin login real).

import type { Dia } from "./horarios";

export interface Usuario {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  desde: string;
  /** true = cuenta recién creada en el demo (sin clases todavía) */
  esNueva: boolean;
}

/** Alumna con la que se "entra" al portal. */
export const ALUMNA_DEMO: Usuario = {
  nombre: "Sofía",
  apellido: "Benítez",
  email: "sofia.benitez@ejemplo.com",
  telefono: "+54 9 11 5555-0123",
  desde: "Marzo 2026",
  esNueva: false,
};

// La actividad de cada horario se toma de la grilla (lib/data/horarios.ts),
// así nunca puede quedar desincronizada.
export const CLASES_DE_ALUMNA: { dia: Dia; hora: string }[] = [
  { dia: "lunes", hora: "18:00" },
  { dia: "miercoles", hora: "18:00" },
  { dia: "viernes", hora: "17:00" },
];

export const PLANES = {
  1: { nombre: "1 clase por semana", monto: 38000 },
  2: { nombre: "2 clases por semana", monto: 52000 },
  3: { nombre: "3 clases por semana", monto: 65000 },
} as const;

export interface Plan {
  nombre: string;
  monto: number;
}

/** Plan que corresponde según la cantidad de clases semanales. null = todavía sin clases. */
export function planPorCantidad(n: number): Plan | null {
  if (n <= 0) return null;
  if (n <= 3) return PLANES[n as 1 | 2 | 3];
  return { nombre: `${n} clases por semana`, monto: PLANES[3].monto };
}

/** El demo siempre muestra la cuota pendiente y a 5 días de vencer. */
export const DIAS_HASTA_VENCIMIENTO = 5;

// Placeholders: reemplazar con los datos reales de la clienta.
export const DATOS_TRANSFERENCIA = {
  titular: "[Titular de la cuenta]",
  banco: "[Banco]",
  alias: "[alias.del.estudio]",
  cbu: "[CBU de 22 dígitos]",
} as const;

export const formatoPeso = (n: number) =>
  "$" + n.toLocaleString("es-AR", { maximumFractionDigits: 0 });
