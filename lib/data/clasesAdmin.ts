// Clases tal como las ve y las gestiona la administradora (Admin > Clases).
//
// Cada clase tiene: actividad, día, hora, profesor/a, cupo máximo y la lista de alumnas anotadas.
// Es el punto de partida de la gestión básica (crear, consultar, editar y eliminar): los cambios
// se hacen en memoria, no se guardan. Todavía NO hay reglas de cancelación, recuperación,
// suplencias ni cambios masivos: eso se define más adelante con la dueña.

import { ACTIVIDADES, type ActividadId } from "./actividades";
import { ALUMNAS, SOFIA_ID } from "./admin";
import { CLASES_DE_ALUMNA } from "./alumna";
import { CAPACIDAD, ocupadasDe } from "./cupos";
import { claveClase, DIAS, TODAS_LAS_CLASES, type Dia } from "./horarios";

export interface ClaseAdmin {
  id: string;
  actividad: ActividadId;
  dia: Dia;
  hora: string;
  profesora: string;
  cupo: number;
  /** Ids de las alumnas anotadas */
  alumnas: number[];
}

/** Datos que se cargan al crear o editar una clase (los cinco campos del formulario). */
export type DatosClase = Pick<ClaseAdmin, "actividad" | "dia" | "hora" | "profesora" | "cupo">;

/** Solo las actividades con grilla de horarios (Yoga Mamá y Esfero Mamá se coordinan a consulta). */
export const ACTIVIDADES_CON_HORARIO = ACTIVIDADES.filter((a) => !a.aConsulta);

/** Horas de clase disponibles en el formulario: de 08:00 a 19:00. */
export const HORAS_DISPONIBLES = Array.from({ length: 12 }, (_, i) => `${String(8 + i).padStart(2, "0")}:00`);

// Profesoras de EJEMPLO para las clases existentes (reemplazar por las reales de la clienta).
export const PROFESORAS_EJEMPLO = ["Lucía", "Carolina", "Mariana"];
const PROFESORA_INICIAL: Record<ActividadId, string> = {
  "pilates-reformer": PROFESORAS_EJEMPLO[0],
  yoga: PROFESORAS_EJEMPLO[1],
  stretching: PROFESORAS_EJEMPLO[1],
  "yoga-mama": PROFESORAS_EJEMPLO[1],
  "metodo-barre": PROFESORAS_EJEMPLO[2],
  "full-body": PROFESORAS_EJEMPLO[2],
  esferodinamia: PROFESORAS_EJEMPLO[2],
  "esfero-mama": PROFESORAS_EJEMPLO[2],
};

const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

/**
 * Reparte a las alumnas en las clases de forma que:
 * - cada clase tiene exactamente las alumnas que indica su ocupación (la misma que ve el portal);
 * - cada alumna está anotada a tantas clases como indica su plan;
 * - Sofía está en las 3 clases que ve en su portal.
 * (Se completa primero con las clases de más lugares libres y prefiriendo días distintos.)
 */
function armarClasesIniciales(): ClaseAdmin[] {
  const restante = new Map(TODAS_LAS_CLASES.map((c) => [claveClase(c.dia, c.hora), ocupadasDe(c)]));
  const anotadas = new Map<string, number[]>(TODAS_LAS_CLASES.map((c) => [claveClase(c.dia, c.hora), []]));

  const anotar = (clave: string, alumnaId: number) => {
    restante.set(clave, (restante.get(clave) ?? 0) - 1);
    anotadas.get(clave)?.push(alumnaId);
  };

  for (const c of CLASES_DE_ALUMNA) anotar(claveClase(c.dia, c.hora), SOFIA_ID);

  const otras = ALUMNAS.filter((a) => a.id !== SOFIA_ID).sort(
    (a, b) => b.clasesPorSemana - a.clasesPorSemana || a.id - b.id,
  );
  for (const alumna of otras) {
    const diasUsados = new Set<Dia>();
    const usadas = new Set<string>();
    for (let n = 0; n < alumna.clasesPorSemana; n++) {
      let mejor: { clave: string; dia: Dia } | null = null;
      let mejorPuntaje = -Infinity;
      for (const c of TODAS_LAS_CLASES) {
        const clave = claveClase(c.dia, c.hora);
        const libres = restante.get(clave) ?? 0;
        if (libres <= 0 || usadas.has(clave)) continue;
        const puntaje = libres * 1000 + (diasUsados.has(c.dia) ? 0 : 100) + (hash(`${alumna.id}-${clave}`) % 100);
        if (puntaje > mejorPuntaje) {
          mejorPuntaje = puntaje;
          mejor = { clave, dia: c.dia };
        }
      }
      if (!mejor) break;
      usadas.add(mejor.clave);
      diasUsados.add(mejor.dia);
      anotar(mejor.clave, alumna.id);
    }
  }

  return TODAS_LAS_CLASES.map((c, i) => ({
    id: `clase-${i + 1}`,
    actividad: c.actividad,
    dia: c.dia,
    hora: c.hora,
    profesora: PROFESORA_INICIAL[c.actividad],
    cupo: CAPACIDAD,
    alumnas: anotadas.get(claveClase(c.dia, c.hora)) ?? [],
  }));
}

export const crearClasesIniciales = armarClasesIniciales;

// ---- Utilidades para trabajar con la lista de clases ----
const indiceDia = (d: Dia) => DIAS.findIndex((x) => x.id === d);

/** Orden semanal: por día y luego por hora. */
export const ordenSemanal = (c: Pick<ClaseAdmin, "dia" | "hora">) => indiceDia(c.dia) * 100 + parseInt(c.hora);

export const estaLlena = (c: ClaseAdmin) => c.alumnas.length >= c.cupo;

const porcentaje = (clases: ClaseAdmin[]) => {
  const cupos = clases.reduce((acc, c) => acc + c.cupo, 0);
  const anotadas = clases.reduce((acc, c) => acc + c.alumnas.length, 0);
  return cupos === 0 ? 0 : Math.round((anotadas / cupos) * 100);
};

/** Ocupación promedio (0–100) de una lista de clases: alumnas anotadas sobre el cupo total. */
export const ocupacionPromedio = porcentaje;

export const ocupacionPorActividad = (clases: ClaseAdmin[]) =>
  ACTIVIDADES_CON_HORARIO.map((a) => ({
    id: a.id,
    nombre: a.nombre,
    porcentaje: porcentaje(clases.filter((c) => c.actividad === a.id)),
    clases: clases.filter((c) => c.actividad === a.id).length,
  }))
    .filter((a) => a.clases > 0)
    .sort((x, y) => y.porcentaje - x.porcentaje);

export const ocupacionPorDia = (clases: ClaseAdmin[]) =>
  DIAS.map((d) => ({ dia: d.id, nombre: d.nombre, porcentaje: porcentaje(clases.filter((c) => c.dia === d.id)) }));

const h = (c: ClaseAdmin) => parseInt(c.hora);
/** Franjas según la hora de inicio de la clase (cubren de 08:00 a 19:00, sin dejar horas afuera). */
export const ocupacionPorFranja = (clases: ClaseAdmin[]) => [
  { nombre: "Mañana · 08 a 11 h", porcentaje: porcentaje(clases.filter((c) => h(c) < 12)) },
  { nombre: "Mediodía · 12 a 15 h", porcentaje: porcentaje(clases.filter((c) => h(c) >= 12 && h(c) < 16)) },
  { nombre: "Tarde · 16 a 19 h", porcentaje: porcentaje(clases.filter((c) => h(c) >= 16)) },
];
