import "server-only";

// Limitador simple en memoria (ventana fija) para login y recuperación de contraseña.
// Suficiente para una sola instancia; si el despliegue pasa a ser multi-instancia
// (varias funciones serverless en paralelo) hace falta un store compartido, ej. Upstash Redis,
// porque cada instancia tendría su propio contador.

interface Intento {
  cuenta: number;
  reiniciaEn: number;
}

const intentos = new Map<string, Intento>();

/**
 * @returns true si la acción está permitida; false si se superó el límite de la ventana.
 */
export function permitir(clave: string, maxIntentos: number, ventanaMs: number): boolean {
  const ahora = Date.now();
  const actual = intentos.get(clave);

  if (!actual || actual.reiniciaEn < ahora) {
    intentos.set(clave, { cuenta: 1, reiniciaEn: ahora + ventanaMs });
    return true;
  }

  if (actual.cuenta >= maxIntentos) return false;

  actual.cuenta += 1;
  return true;
}
