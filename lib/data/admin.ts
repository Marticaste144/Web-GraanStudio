// Datos MOCK del panel de administración.
// Todo sale de una única lista de alumnas (ALUMNAS): los pagos, los ingresos y los totales
// se calculan a partir de ella, así las pantallas del admin siempre son coherentes entre sí.
// Las clases y qué alumnas están anotadas en cada una viven en lib/data/clasesAdmin.ts.

import { ALUMNA_DEMO, PLANES } from "./alumna";
import { TOTAL_INSCRIPCIONES } from "./cupos";

export type MedioDePago = "Transferencia" | "Efectivo" | "Mercado Pago";
export type EstadoPago = "Aprobado" | "Pendiente";
export type ClasesPorSemana = 1 | 2 | 3;

export interface Alumna {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  clasesPorSemana: ClasesPorSemana;
  plan: string;
  monto: number;
  medio: MedioDePago;
  /** Estado del pago del mes */
  estado: EstadoPago;
  /** Hace cuántos días se registró el pago (o se cargó el comprobante) */
  hace: number;
  desde: string;
  /** true = alumna dada de alta manualmente desde el Admin (todavía sin pagos ni asistencias) */
  altaManual?: boolean;
}

/** Las alumnas dadas de alta desde el Admin usan ids desde este número, para no chocar con las de ejemplo. */
export const PRIMER_ID_ALTA_MANUAL = 1000;

/** Id de Sofía Benítez, la alumna con la que se entra al portal (tercera de la lista). */
export const SOFIA_ID = 3;

// Las primeras alumnas están escritas a mano (son las que se ven en "Pagos recientes").
const DESTACADAS: [string, string, ClasesPorSemana, MedioDePago, EstadoPago][] = [
  ["Valentina", "Ruiz", 3, "Transferencia", "Aprobado"],
  ["Camila", "Fernández", 2, "Mercado Pago", "Aprobado"],
  ["Sofía", "Benítez", 3, "Transferencia", "Pendiente"],
  ["Lucía", "Martínez", 1, "Efectivo", "Aprobado"],
  ["Agustina", "López", 2, "Transferencia", "Aprobado"],
  ["Julieta", "Gómez", 3, "Mercado Pago", "Pendiente"],
  ["Martina", "Sosa", 2, "Transferencia", "Aprobado"],
  ["Paula", "Acosta", 1, "Efectivo", "Aprobado"],
];

const NOMBRES = [
  "Florencia", "Micaela", "Carolina", "Daniela", "Rocío", "Melina", "Natalia", "Belén", "Victoria",
  "Constanza", "Antonella", "Milagros", "Lorena", "Romina", "Candela", "Abril", "Jazmín", "Emilia",
  "Mariana", "Silvina", "Bianca", "Ludmila", "Renata", "Pilar", "Guadalupe",
];
const APELLIDOS = [
  "Romero", "Díaz", "Álvarez", "Torres", "Ríos", "Herrera", "Medina", "Castro", "Vega", "Molina",
  "Suárez", "Ortiz", "Silva", "Rojas", "Núñez", "Peralta", "Flores", "Ramos", "Aguirre", "Costa",
  "Navarro", "Blanco", "Ledesma", "Correa", "Ibarra", "Godoy", "Paz",
];
const PLAN_POR_INDICE: ClasesPorSemana[] = [3, 3, 2, 2, 3, 1, 2, 3, 2, 1];
const MEDIO_POR_INDICE: MedioDePago[] = [
  "Transferencia", "Transferencia", "Mercado Pago", "Efectivo", "Transferencia", "Mercado Pago",
];
const MESES_DESDE = [
  "Marzo 2026", "Abril 2026", "Mayo 2026", "Junio 2026", "Julio 2026",
  "Agosto 2026", "Noviembre 2025", "Diciembre 2025", "Febrero 2026",
];

const sinTildes = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/**
 * Cuántas clases por semana tiene cada alumna. Se generan alumnas hasta que la suma de sus clases
 * iguala a las inscripciones totales del estudio: así "cuántas alumnas hay en cada clase" y
 * "cuántas clases tiene cada alumna" coinciden exactamente.
 */
function clasesPorAlumna(): ClasesPorSemana[] {
  const lista: ClasesPorSemana[] = [];
  let acumulado = 0;
  for (let i = 0; acumulado < TOTAL_INSCRIPCIONES; i++) {
    const previsto = i < DESTACADAS.length ? DESTACADAS[i][2] : PLAN_POR_INDICE[(i - DESTACADAS.length) % PLAN_POR_INDICE.length];
    const k = Math.min(previsto, TOTAL_INSCRIPCIONES - acumulado) as ClasesPorSemana;
    lista.push(k);
    acumulado += k;
  }
  return lista;
}

function armarAlumna(
  id: number,
  nombre: string,
  apellido: string,
  clases: ClasesPorSemana,
  medio: MedioDePago,
  estado: EstadoPago,
  hace: number,
): Alumna {
  return {
    id,
    nombre,
    apellido,
    email: `${sinTildes(nombre)}.${sinTildes(apellido)}@ejemplo.com`,
    telefono: `+54 9 11 ${5000 + ((id * 137) % 4000)}-${1000 + ((id * 731) % 9000)}`,
    clasesPorSemana: clases,
    plan: PLANES[clases].nombre,
    monto: PLANES[clases].monto,
    medio,
    estado,
    hace,
    desde: MESES_DESDE[id % MESES_DESDE.length],
  };
}

export const ALUMNAS: Alumna[] = clasesPorAlumna().map((k, i) => {
  if (i < DESTACADAS.length) {
    const [n, a, , m, e] = DESTACADAS[i];
    const alumna = armarAlumna(i + 1, n, a, k, m, e, i % 4);
    // Sofía es la alumna del portal: sus datos tienen que coincidir con los de la vista de alumna.
    return alumna.id === SOFIA_ID
      ? { ...alumna, email: ALUMNA_DEMO.email, telefono: ALUMNA_DEMO.telefono, desde: ALUMNA_DEMO.desde }
      : alumna;
  }
  const g = i - DESTACADAS.length;
  return armarAlumna(
    i + 1,
    NOMBRES[g % NOMBRES.length],
    APELLIDOS[g % APELLIDOS.length],
    k,
    MEDIO_POR_INDICE[g % MEDIO_POR_INDICE.length],
    g % 9 === 4 ? "Pendiente" : "Aprobado",
    4 + ((g * 3) % 22),
  );
});

export const ALUMNAS_ACTIVAS = ALUMNAS.length;

export const getAlumna = (id: number): Alumna | undefined => ALUMNAS.find((a) => a.id === id);

// ---- Pagos (uno por alumna en el mes), del más reciente al más antiguo ----
export type Pago = Alumna;
export const PAGOS: Pago[] = [...ALUMNAS].sort((a, b) => a.hace - b.hace || a.id - b.id);
export const PAGOS_RECIENTES = PAGOS.slice(0, 8);
export const PAGOS_PENDIENTES = PAGOS.filter((p) => p.estado === "Pendiente");

const sumar = (l: Alumna[]) => l.reduce((acc, p) => acc + p.monto, 0);
export const INGRESOS_DEL_MES = sumar(ALUMNAS.filter((a) => a.estado === "Aprobado"));
export const PENDIENTE_DE_COBRO = sumar(PAGOS_PENDIENTES);

// ---- Métricas de alumnas y pagos ----
export const DISTRIBUCION_PLANES = ([1, 2, 3] as const).map((n) => ({
  nombre: PLANES[n].nombre,
  cantidad: ALUMNAS.filter((a) => a.clasesPorSemana === n).length,
}));

export const DISTRIBUCION_MEDIOS = (["Transferencia", "Mercado Pago", "Efectivo"] as MedioDePago[]).map((m) => ({
  nombre: m,
  cantidad: ALUMNAS.filter((a) => a.medio === m).length,
}));

/** Ingresos de los 5 meses anteriores (mock): una tendencia creciente que termina cerca del mes actual. */
export const INGRESOS_MESES_ANTERIORES = [0.66, 0.72, 0.79, 0.86, 0.93].map(
  (f) => Math.round((INGRESOS_DEL_MES * f) / 10000) * 10000,
);
