import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

// Hash de contraseñas con scrypt (nativo de Node, sin dependencias externas).
// Formato almacenado: "saltHex:hashHex".
const KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const hashBuffer = Buffer.from(hash, "hex");
  const candidate = scryptSync(password, salt, KEY_LENGTH);
  if (candidate.length !== hashBuffer.length) return false;
  return timingSafeEqual(candidate, hashBuffer);
}

/** Requisito mínimo de contraseña para este bloque: 8 caracteres. */
export function passwordEsValida(password: string): boolean {
  return typeof password === "string" && password.length >= 8;
}
