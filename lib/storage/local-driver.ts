import "server-only";

import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { StorageDriver } from "./index";

// Fuera de /public (nunca servido como estático) y fuera del control de git (ver .gitignore).
const RAIZ = path.join(process.cwd(), ".private-uploads");

/** Evita path traversal (".." o separadores) en la key: cada archivo queda contenido en RAIZ. */
function rutaSegura(key: string): string {
  const normalizada = path.normalize(key).replace(/^[/\\]+/, "");
  if (normalizada.split(/[/\\]/).includes("..")) {
    throw new Error(`Storage key inválida: ${key}`);
  }
  return path.join(RAIZ, normalizada);
}

export const localDriver: StorageDriver = {
  async put(key, data, contentType) {
    const destino = rutaSegura(key);
    await mkdir(path.dirname(destino), { recursive: true });
    await writeFile(destino, data);
    await writeFile(`${destino}.meta.json`, JSON.stringify({ contentType }));
  },

  async read(key) {
    const destino = rutaSegura(key);
    try {
      const [data, metaRaw] = await Promise.all([
        readFile(destino),
        readFile(`${destino}.meta.json`, "utf-8"),
      ]);
      const { contentType } = JSON.parse(metaRaw) as { contentType: string };
      return { data, contentType };
    } catch {
      return null;
    }
  },

  async delete(key) {
    const destino = rutaSegura(key);
    await Promise.allSettled([rm(destino, { force: true }), rm(`${destino}.meta.json`, { force: true })]);
  },
};
