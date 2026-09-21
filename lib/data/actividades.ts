// Catálogo de actividades del estudio.

export type ActividadId =
  | "pilates-reformer"
  | "yoga"
  | "metodo-barre"
  | "stretching"
  | "esferodinamia"
  | "full-body"
  | "yoga-mama"
  | "esfero-mama";

// Familia = agrupa colores en la grilla de horarios.
export type Familia = "pilates" | "yoga" | "esfera";

export type IconoActividad =
  | "reformer"
  | "yoga"
  | "barre"
  | "stretching"
  | "esfera"
  | "fullbody"
  | "mama";

export interface Actividad {
  id: ActividadId;
  nombre: string;
  descripcion: string;
  familia: Familia;
  icono: IconoActividad;
  /** true = se coordina por consulta (sin grilla de horarios) */
  aConsulta: boolean;
}

export const ACTIVIDADES: Actividad[] = [
  {
    id: "pilates-reformer",
    nombre: "Pilates Reformer",
    descripcion:
      "Fuerza, control y elongación sobre la máquina Reformer. Se adapta a cualquier nivel.",
    familia: "pilates",
    icono: "reformer",
    aConsulta: false,
  },
  {
    id: "yoga",
    nombre: "Yoga",
    descripcion:
      "Posturas, respiración y atención plena para ganar flexibilidad y soltar tensiones.",
    familia: "yoga",
    icono: "yoga",
    aConsulta: false,
  },
  {
    id: "metodo-barre",
    nombre: "Método Barre",
    descripcion:
      "Inspirado en la barra de ballet: movimientos pequeños y precisos que tonifican todo el cuerpo.",
    familia: "pilates",
    icono: "barre",
    aConsulta: false,
  },
  {
    id: "stretching",
    nombre: "Stretching",
    descripcion:
      "Elongación guiada para recuperar movilidad, aliviar la rigidez y descansar el cuerpo.",
    familia: "yoga",
    icono: "stretching",
    aConsulta: false,
  },
  {
    id: "esferodinamia",
    nombre: "Esferodinamia",
    descripcion:
      "Ejercicios sobre pelota para mejorar la postura, el equilibrio y la estabilidad del centro.",
    familia: "esfera",
    icono: "esfera",
    aConsulta: false,
  },
  {
    id: "full-body",
    nombre: "Full Body",
    descripcion:
      "Entrenamiento integral que activa todo el cuerpo, con foco en fuerza y resistencia.",
    familia: "pilates",
    icono: "fullbody",
    aConsulta: false,
  },
  {
    id: "yoga-mama",
    nombre: "Yoga Mamá",
    descripcion:
      "Clases especiales para embarazadas: movimiento suave, respiración y conexión con tu bebé.",
    familia: "yoga",
    icono: "mama",
    aConsulta: true,
  },
  {
    id: "esfero-mama",
    nombre: "Esfero Mamá",
    descripcion:
      "Esferodinamia adaptada al embarazo para aliviar molestias y sostener el cuerpo con seguridad.",
    familia: "esfera",
    icono: "mama",
    aConsulta: true,
  },
];

const porId = new Map(ACTIVIDADES.map((a) => [a.id, a]));

export function getActividad(id: ActividadId): Actividad {
  const a = porId.get(id);
  if (!a) throw new Error(`Actividad desconocida: ${id}`);
  return a;
}
