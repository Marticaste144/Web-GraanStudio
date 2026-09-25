// Constantes centrales del Bloque 5 (grilla, horarios habituales, asistencia, recuperaciones).
// Nunca hardcodear estos valores en otro lugar del código.

/** Mínimo de anticipación para que un aviso de ausencia sea válido (sección 16). Exacto = válido. */
export const MINUTOS_AVISO_MINIMO = 3 * 60;

/** Vigencia del derecho a recuperar: fecha de la clase original + esta cantidad de días, inclusive. */
export const DIAS_VIGENCIA_RECUPERACION = 7;
