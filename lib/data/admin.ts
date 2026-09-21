// Datos MOCK del panel de administración.

import { ACTIVIDADES, type ActividadId } from "./actividades";
import { PLANES } from "./alumna";
import { CAPACIDAD, ocupadasDe, TOTAL_INSCRIPCIONES } from "./cupos";
import { clasesDeActividad } from "./horarios";

// Cada alumna toma ~3 horarios fijos en promedio; de ahí sale la cantidad de alumnas activas.
export const HORARIOS_POR_ALUMNA = 3;
export const ALUMNAS_ACTIVAS = Math.round(TOTAL_INSCRIPCIONES / HORARIOS_POR_ALUMNA);
export const INGRESOS_DEL_MES = 5_420_000;

/** Ocupación (0–100) de una actividad: promedio de todos sus horarios semanales. */
export function ocupacionDeActividad(id: ActividadId): number {
  const clases = clasesDeActividad(id);
  if (clases.length === 0) return 0;
  const ocupadas = clases.reduce((acc, c) => acc + ocupadasDe(c), 0);
  return Math.round((ocupadas / (clases.length * CAPACIDAD)) * 100);
}

export const OCUPACION_POR_ACTIVIDAD = ACTIVIDADES.filter((a) => !a.aConsulta)
  .map((a) => ({ id: a.id, nombre: a.nombre, porcentaje: ocupacionDeActividad(a.id) }))
  .sort((a, b) => b.porcentaje - a.porcentaje);

export const OCUPACION_PROMEDIO = Math.round(
  (TOTAL_INSCRIPCIONES /
    (OCUPACION_POR_ACTIVIDAD.reduce((acc, a) => acc + clasesDeActividad(a.id).length, 0) *
      CAPACIDAD)) *
    100,
);

export type MedioDePago = "Transferencia" | "Efectivo" | "Mercado Pago";
export type EstadoPago = "Aprobado" | "Pendiente";

export interface Pago {
  alumna: string;
  plan: (typeof PLANES)[1 | 2 | 3]["nombre"];
  monto: number;
  medio: MedioDePago;
  estado: EstadoPago;
}

const pago = (
  alumna: string,
  clasesPorSemana: 1 | 2 | 3,
  medio: MedioDePago,
  estado: EstadoPago,
): Pago => ({
  alumna,
  plan: PLANES[clasesPorSemana].nombre,
  monto: PLANES[clasesPorSemana].monto,
  medio,
  estado,
});

export const PAGOS_RECIENTES: Pago[] = [
  pago("Valentina Ruiz", 3, "Transferencia", "Aprobado"),
  pago("Camila Fernández", 2, "Mercado Pago", "Aprobado"),
  pago("Sofía Benítez", 3, "Transferencia", "Pendiente"),
  pago("Lucía Martínez", 1, "Efectivo", "Aprobado"),
  pago("Agustina López", 2, "Transferencia", "Aprobado"),
  pago("Julieta Gómez", 3, "Mercado Pago", "Pendiente"),
  pago("Martina Sosa", 2, "Transferencia", "Aprobado"),
  pago("Paula Acosta", 1, "Efectivo", "Aprobado"),
];
