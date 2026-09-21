// Cupos MOCK. Ninguna de estas cifras viene de un sistema real: se generan de forma
// determinística (siempre dan lo mismo) para que el demo sea consistente entre pantallas.

import { type Dia, type Clase, claveClase, TODAS_LAS_CLASES } from "./horarios";

export const CAPACIDAD = 8;

// Ocupación base según la hora (las primeras y últimas horas del día son las más pedidas).
const BASE_POR_HORA: Record<string, number> = {
  "08:00": 6,
  "09:00": 7,
  "10:00": 5,
  "11:00": 5,
  "12:00": 4,
  "13:00": 4,
  "14:00": 3,
  "16:00": 5,
  "17:00": 6,
  "18:00": 7,
  "19:00": 6,
};

// Clases que queremos mostrar como completas (8/8) para poder enseñar la "Lista de espera".
const COMPLETAS: string[] = [
  "martes-10:00", // Yoga
  "lunes-16:00", // Método Barre
  "jueves-17:00", // Pilates Reformer
  "viernes-09:00", // Pilates Reformer
  "miercoles-19:00", // Pilates Reformer
];

// Clases con pocos lugares ocupados.
const CASI_VACIAS: Record<string, number> = {
  "jueves-11:00": 4, // Stretching
  "viernes-11:00": 3, // Full Body
  "miercoles-17:00": 3, // Esferodinamia
};

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function ocupadas(dia: Dia, hora: string): number {
  const k = claveClase(dia, hora);
  if (COMPLETAS.includes(k)) return CAPACIDAD;
  if (k in CASI_VACIAS) return CASI_VACIAS[k];
  const base = BASE_POR_HORA[hora] ?? 5;
  const jitter = (hash(k) % 4) - 1; // -1..2
  return Math.min(CAPACIDAD - 1, Math.max(1, base + jitter));
}

export const lugaresLibres = (dia: Dia, hora: string) => CAPACIDAD - ocupadas(dia, hora);

export const ocupadasDe = (c: Clase) => ocupadas(c.dia, c.hora);

export const TOTAL_INSCRIPCIONES = TODAS_LAS_CLASES.reduce((acc, c) => acc + ocupadasDe(c), 0);
