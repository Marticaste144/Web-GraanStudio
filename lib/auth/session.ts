import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE = "graan_session";
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 días

function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

/** El token crudo nunca se persiste: solo su hash. Así un dump de la DB no sirve para robar sesiones. */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Crea una sesión real en la base y deja el token (crudo) en una cookie HttpOnly.
 * Debe llamarse desde una Server Action o Route Handler (son los únicos contextos donde
 * Next.js permite escribir cookies).
 */
export async function crearSesion(userId: string, userAgent?: string | null) {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.session.create({
    data: { userId, tokenHash: hashToken(token), expiresAt, userAgent: userAgent ?? undefined },
  });

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** Lee la sesión vigente desde la cookie (si existe) contra la base. Válida en cualquier contexto server. */
export async function leerSesion() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date() || !session.user.isActive) return null;
  return session;
}

/** Cierra la sesión actual: borra la fila en la base (invalidación real) y limpia la cookie. */
export async function destruirSesionActual() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } }).catch(() => {});
  }
  jar.delete(SESSION_COOKIE);
}

/** Invalida TODAS las sesiones de un usuario (cambio/recuperación de contraseña). */
export async function destruirSesionesDeUsuario(userId: string) {
  await prisma.session.deleteMany({ where: { userId } });
}
