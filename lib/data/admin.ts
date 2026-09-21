// Datos MOCK del panel de administración.
// Todo sale de una única lista de alumnas (ALUMNAS): los pagos, los ingresos y los totales
// se calculan a partir de ella, así las pantallas del admin siempre son coherentes entre sí.

import { ACTIVIDADES, type ActividadId } from "./actividades";
import { ALUMNA_DEMO, CLASES_DE_ALUMNA, PLANES } from "./alumna";
import { CAPACIDAD, ocupadasDe, TOTAL_INSCRIPCIONES } from "./cupos";
import { clasesDeActividad, clasesDelDia, DIAS, TODAS_LAS_CLASES, type Clase, type Dia } from "./horarios";

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
}

// Cada alumna toma ~3 clases semanales en promedio; de ahí sale la cantidad de alumnas activas.
export const HORARIOS_POR_ALUMNA = 3;
export const ALUMNAS_ACTIVAS = Math.round(TOTAL_INSCRIPCIONES / HORARIOS_POR_ALUMNA);

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

export const ALUMNAS: Alumna[] = Array.from({ length: ALUMNAS_ACTIVAS }, (_, i) => {
  if (i < DESTACADAS.length) {
    const [n, a, c, m, e] = DESTACADAS[i];
    const alumna = armarAlumna(i + 1, n, a, c, m, e, i % 4);
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
    PLAN_POR_INDICE[g % PLAN_POR_INDICE.length],
    MEDIO_POR_INDICE[g % MEDIO_POR_INDICE.length],
    g % 9 === 4 ? "Pendiente" : "Aprobado",
    4 + ((g * 3) % 22),
  );
});

// ---- Pagos (uno por alumna en el mes), del más reciente al más antiguo ----
export type Pago = Alumna;
export const PAGOS: Pago[] = [...ALUMNAS].sort((a, b) => a.hace - b.hace || a.id - b.id);
export const PAGOS_RECIENTES = PAGOS.slice(0, 8);
export const PAGOS_PENDIENTES = PAGOS.filter((p) => p.estado === "Pendiente");

const sumar = (l: Alumna[]) => l.reduce((acc, p) => acc + p.monto, 0);
export const INGRESOS_DEL_MES = sumar(ALUMNAS.filter((a) => a.estado === "Aprobado"));
export const PENDIENTE_DE_COBRO = sumar(PAGOS_PENDIENTES);

// ---- Ocupación ----
const promedio = (clases: Clase[]) =>
  clases.length === 0
    ? 0
    : Math.round((clases.reduce((acc, c) => acc + ocupadasDe(c), 0) / (clases.length * CAPACIDAD)) * 100);

/** Ocupación (0–100) de una actividad: promedio de todos sus horarios semanales. */
export const ocupacionDeActividad = (id: ActividadId) => promedio(clasesDeActividad(id));

export const OCUPACION_POR_ACTIVIDAD = ACTIVIDADES.filter((a) => !a.aConsulta)
  .map((a) => ({ id: a.id, nombre: a.nombre, porcentaje: ocupacionDeActividad(a.id) }))
  .sort((a, b) => b.porcentaje - a.porcentaje);

export const OCUPACION_PROMEDIO = promedio(TODAS_LAS_CLASES);

export const OCUPACION_POR_DIA: { dia: Dia; nombre: string; porcentaje: number }[] = DIAS.map((d) => ({
  dia: d.id,
  nombre: d.nombre,
  porcentaje: promedio(TODAS_LAS_CLASES.filter((c) => c.dia === d.id)),
}));

const h = (c: Clase) => parseInt(c.hora);
export const OCUPACION_POR_FRANJA = [
  { nombre: "Mañana · 08 a 12 h", porcentaje: promedio(TODAS_LAS_CLASES.filter((c) => h(c) < 12)) },
  { nombre: "Mediodía · 12 a 15 h", porcentaje: promedio(TODAS_LAS_CLASES.filter((c) => h(c) >= 12 && h(c) < 15)) },
  { nombre: "Tarde · 16 a 19 h", porcentaje: promedio(TODAS_LAS_CLASES.filter((c) => h(c) >= 16)) },
];

// ---- Métricas ----
export const DISTRIBUCION_PLANES = ([1, 2, 3] as const).map((n) => ({
  nombre: PLANES[n].nombre,
  cantidad: ALUMNAS.filter((a) => a.clasesPorSemana === n).length,
}));

export const DISTRIBUCION_MEDIOS = (["Transferencia", "Mercado Pago", "Efectivo"] as MedioDePago[]).map((m) => ({
  nombre: m,
  cantidad: ALUMNAS.filter((a) => a.medio === m).length,
}));

/** Ingresos de los 5 meses anteriores (mock) + el mes actual (calculado). */
export const INGRESOS_MESES_ANTERIORES = [3_150_000, 3_480_000, 3_820_000, 4_090_000, 4_350_000];
export const INGRESOS_SERIE = [...INGRESOS_MESES_ANTERIORES, INGRESOS_DEL_MES];
