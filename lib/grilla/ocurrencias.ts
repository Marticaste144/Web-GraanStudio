import "server-only";

// Generación idempotente de ClaseOcurrencia a partir de ClaseRecurrente (sección 7 del Bloque 5).
// No es una Server Action ni depende de un botón manual: la página de la grilla la llama sola,
// on-demand, cada vez que se navega (adelante o atrás) a una semana puntual. Como cada llamada
// respeta @@unique([claseRecurrenteId, fecha]) vía skipDuplicates, visitar la misma semana muchas
// veces nunca duplica nada, y una ocurrencia que ya existe (con asistencia, profesora real,
// cancelación, etc. ya cargada) nunca se toca ni se recrea.

import { prisma } from "@/lib/prisma";
import type { Dia } from "@/lib/data/horarios";
import { sumarDias } from "./semana";

const INDICE_DIA: Record<Dia, number> = { lunes: 0, martes: 1, miercoles: 2, jueves: 3, viernes: 4 };

export interface ResultadoAsegurarSemana {
  creadas: number;
  /** Cuántas ClaseRecurrente activas hay en todo el sistema. 0 = la semana está vacía de verdad (no es un error). */
  totalRecurrentesActivas: number;
}

/**
 * Asegura que la semana que empieza en `lunes` tenga generadas sus ClaseOcurrencia, generando
 * únicamente las que falten. No genera nada para semanas que no se piden (no hay precarga de
 * futuro: es estrictamente bajo demanda, así nunca se generan fechas que nadie va a mirar).
 */
export async function asegurarOcurrenciasDeSemana(lunes: Date): Promise<ResultadoAsegurarSemana> {
  const recurrentes = await prisma.claseRecurrente.findMany({ where: { activa: true }, select: { id: true, dia: true } });
  if (recurrentes.length === 0) return { creadas: 0, totalRecurrentesActivas: 0 };

  const filas: { claseRecurrenteId: string; fecha: Date }[] = [];
  for (const rec of recurrentes) {
    const offset = INDICE_DIA[rec.dia as Dia];
    if (offset === undefined) continue; // dia inválido/legacy: se ignora, no se inventa una fecha
    filas.push({ claseRecurrenteId: rec.id, fecha: sumarDias(lunes, offset) });
  }

  if (filas.length === 0) return { creadas: 0, totalRecurrentesActivas: recurrentes.length };
  const resultado = await prisma.claseOcurrencia.createMany({ data: filas, skipDuplicates: true });
  return { creadas: resultado.count, totalRecurrentesActivas: recurrentes.length };
}
