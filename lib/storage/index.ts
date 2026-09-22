import "server-only";

export interface ArchivoAlmacenado {
  data: Buffer;
  contentType: string;
}

export interface StorageDriver {
  put(key: string, data: Buffer, contentType: string): Promise<void>;
  read(key: string): Promise<ArchivoAlmacenado | null>;
  delete(key: string): Promise<void>;
}

/**
 * Almacenamiento PRIVADO (comprobantes, etc.): los archivos nunca quedan en una URL pública
 * permanente. Se guardan con esta interfaz y solo se sirven a través de una ruta autenticada
 * (ver app/api/files/[...path]/route.ts) que valida sesión, rol y pertenencia antes de leer.
 *
 * Driver activo por STORAGE_DRIVER (default "local", disco fuera de /public, para desarrollo).
 * Para producción: implementar esta misma interfaz contra Vercel Blob, S3 o Supabase Storage
 * (idealmente devolviendo URLs firmadas y temporales en vez de leer el archivo entero en el
 * server) y cambiar STORAGE_DRIVER.
 */
async function getDriver(): Promise<StorageDriver> {
  const driver = process.env.STORAGE_DRIVER ?? "local";

  if (driver === "local") {
    const { localDriver } = await import("./local-driver");
    return localDriver;
  }

  throw new Error(`STORAGE_DRIVER="${driver}" no está implementado todavía.`);
}

export async function guardarArchivo(key: string, data: Buffer, contentType: string) {
  const driver = await getDriver();
  return driver.put(key, data, contentType);
}

export async function leerArchivo(key: string) {
  const driver = await getDriver();
  return driver.read(key);
}

export async function borrarArchivo(key: string) {
  const driver = await getDriver();
  return driver.delete(key);
}
