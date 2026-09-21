// Horario semanal del estudio (Lunes a Viernes, 08:00 a 19:00, sin actividad a las 15:00).
// Para cambiar un horario, editá la GRILLA de abajo: una fila por hora, una columna por día.
// `null` = sin actividad.

import { type ActividadId, getActividad } from "./actividades";

export type Dia = "lunes" | "martes" | "miercoles" | "jueves" | "viernes";

export const DIAS: { id: Dia; nombre: string; corto: string }[] = [
  { id: "lunes", nombre: "Lunes", corto: "Lun" },
  { id: "martes", nombre: "Martes", corto: "Mar" },
  { id: "miercoles", nombre: "Miércoles", corto: "Mié" },
  { id: "jueves", nombre: "Jueves", corto: "Jue" },
  { id: "viernes", nombre: "Viernes", corto: "Vie" },
];

export const nombreDia = (d: Dia) => DIAS.find((x) => x.id === d)!.nombre;
export const cortoDia = (d: Dia) => DIAS.find((x) => x.id === d)!.corto;

type Celda = ActividadId | null;

const R: ActividadId = "pilates-reformer";
const Y: ActividadId = "yoga";
const B: ActividadId = "metodo-barre";
const S: ActividadId = "stretching";
const E: ActividadId = "esferodinamia";
const F: ActividadId = "full-body";

//                      Lun  Mar  Mié  Jue  Vie
export const GRILLA: { hora: string; dias: [Celda, Celda, Celda, Celda, Celda] }[] = [
  { hora: "08:00", dias: [R, R, R, R, R] },
  { hora: "09:00", dias: [R, R, R, R, R] },
  { hora: "10:00", dias: [R, Y, R, B, R] },
  { hora: "11:00", dias: [R, R, R, S, F] },
  { hora: "12:00", dias: [R, R, R, R, R] },
  { hora: "13:00", dias: [R, R, R, R, R] },
  { hora: "14:00", dias: [R, Y, null, null, Y] },
  // 15:00 → sin actividad en ningún día
  { hora: "16:00", dias: [B, R, null, R, null] },
  { hora: "17:00", dias: [R, R, E, R, E] },
  { hora: "18:00", dias: [R, R, R, R, R] },
  { hora: "19:00", dias: [R, R, R, R, R] },
];

export const HORA_SIN_ACTIVIDAD = "15:00";

export interface Clase {
  dia: Dia;
  hora: string;
  actividad: ActividadId;
}

/** Todas las clases de la semana, aplanadas. */
export const TODAS_LAS_CLASES: Clase[] = GRILLA.flatMap(({ hora, dias }) =>
  dias.flatMap((actividad, i) =>
    actividad ? [{ dia: DIAS[i].id, hora, actividad }] : [],
  ),
);

export const claveClase = (dia: Dia, hora: string) => `${dia}-${hora}`;

export const actividadEn = (dia: Dia, hora: string): ActividadId | null =>
  TODAS_LAS_CLASES.find((c) => c.dia === dia && c.hora === hora)?.actividad ?? null;

export const clasesDeActividad = (id: ActividadId) =>
  TODAS_LAS_CLASES.filter((c) => c.actividad === id);

export const clasesDelDia = (dia: Dia) => TODAS_LAS_CLASES.filter((c) => c.dia === dia);

export const nombreActividadEn = (dia: Dia, hora: string) => {
  const id = actividadEn(dia, hora);
  return id ? getActividad(id).nombre : "Sin actividad";
};
