"use server";

import { createHash, randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { registrarAuditoria } from "@/lib/audit";
import { sendEmail } from "@/lib/email";
import { getCurrentUser } from "@/lib/auth/current-user";
import { can } from "@/lib/auth/rbac";
import { REGISTRO_PUBLICO_HABILITADO } from "@/lib/auth/feature-flags";
import { permitir } from "@/lib/auth/rate-limit";
import { hashPassword, passwordEsValida, verifyPassword } from "@/lib/auth/password";
import { crearSesion, destruirSesionActual, destruirSesionesDeUsuario } from "@/lib/auth/session";

type ActionResult<T = Record<string, never>> = { ok: true } & T | { ok: false; error: string };

const MENSAJE_LOGIN_INVALIDO = "Email o contraseña incorrectos.";
const MENSAJE_RATE_LIMIT = "Demasiados intentos. Probá de nuevo en unos minutos.";

async function ip(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

async function userAgent(): Promise<string | null> {
  const h = await headers();
  return h.get("user-agent");
}

async function origen(): Promise<string> {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

// ---------------------------------------------------------------------------
// Login / logout
// ---------------------------------------------------------------------------

/**
 * Superficie que se está usando para loguearse: determina qué roles se aceptan y evita que,
 * por ejemplo, una alumna entre por el acceso de administración (o viceversa).
 */
export type Superficie = "admin" | "alumno";

export async function loginAction(
  superficie: Superficie,
  email: string,
  password: string,
): Promise<ActionResult<{ redirectTo: string; mustChangePassword: boolean }>> {
  const correo = email.trim().toLowerCase();
  const clave = `login:${await ip()}:${correo}`;
  if (!permitir(clave, 5, 15 * 60 * 1000)) return { ok: false, error: MENSAJE_RATE_LIMIT };

  const user = await prisma.user.findUnique({ where: { email: correo } });
  if (!user || !user.isActive || !verifyPassword(password, user.passwordHash)) {
    return { ok: false, error: MENSAJE_LOGIN_INVALIDO };
  }

  const permiso = superficie === "admin" ? "admin:access" : "alumno:access";
  if (!can(user.role, permiso)) {
    return {
      ok: false,
      error:
        superficie === "admin"
          ? "Esta cuenta no tiene acceso al panel de administración."
          : "Esta cuenta no es una cuenta de alumna. Usá el acceso de administración.",
    };
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await crearSesion(user.id, await userAgent());
  await registrarAuditoria({
    actorUserId: user.id,
    actorRole: user.role,
    action: "auth.login",
    entityType: "User",
    entityId: user.id,
  });

  return {
    ok: true,
    redirectTo: user.mustChangePassword ? "/cambiar-contrasena" : superficie === "admin" ? "/admin" : "/alumno",
    mustChangePassword: user.mustChangePassword,
  };
}

export async function logoutAction(): Promise<void> {
  const user = await getCurrentUser();
  await destruirSesionActual();
  if (user) {
    await registrarAuditoria({
      actorUserId: user.id,
      actorRole: user.role,
      action: "auth.logout",
      entityType: "User",
      entityId: user.id,
    });
  }
}

// ---------------------------------------------------------------------------
// Registro (autoservicio de alumnas)
// ---------------------------------------------------------------------------

export async function registerAction(datos: {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
}): Promise<ActionResult<{ redirectTo: string }>> {
  // Chequeo server-side real: aunque alguien invoque esta Server Action sin pasar por el
  // formulario (curl, devtools, etc.), el alta pública sigue bloqueada.
  if (!REGISTRO_PUBLICO_HABILITADO) {
    return { ok: false, error: "La creación de cuentas está temporalmente deshabilitada. Contactá al estudio para darte de alta." };
  }

  const nombre = datos.nombre.trim();
  const apellido = datos.apellido.trim();
  const correo = datos.email.trim().toLowerCase();

  if (!nombre || !apellido) return { ok: false, error: "Completá nombre y apellido." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return { ok: false, error: "El email no es válido." };
  if (!passwordEsValida(datos.password)) return { ok: false, error: "La contraseña debe tener al menos 8 caracteres." };

  const existente = await prisma.user.findUnique({ where: { email: correo } });
  if (existente) return { ok: false, error: "Ya existe una cuenta con ese email." };

  const user = await prisma.user.create({
    data: {
      email: correo,
      passwordHash: hashPassword(datos.password),
      role: "STUDENT",
      displayName: `${nombre} ${apellido}`,
      // Se registró con una contraseña elegida por ella: no hace falta forzar un cambio.
      mustChangePassword: false,
    },
  });

  await crearSesion(user.id, await userAgent());
  await registrarAuditoria({
    actorUserId: user.id,
    actorRole: user.role,
    action: "auth.register",
    entityType: "User",
    entityId: user.id,
  });

  return { ok: true, redirectTo: "/alumno" };
}

// ---------------------------------------------------------------------------
// Cambio de contraseña (autenticada)
// ---------------------------------------------------------------------------

export async function changePasswordAction(
  currentPassword: string,
  newPassword: string,
): Promise<ActionResult<{ redirectTo: string }>> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Tu sesión venció. Iniciá sesión de nuevo." };
  if (!verifyPassword(currentPassword, user.passwordHash)) {
    return { ok: false, error: "La contraseña actual no es correcta." };
  }
  if (!passwordEsValida(newPassword)) return { ok: false, error: "La contraseña nueva debe tener al menos 8 caracteres." };

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hashPassword(newPassword), mustChangePassword: false },
  });

  // Invalida todas las sesiones (incluida esta) y abre una nueva para no cortar el dispositivo actual.
  await destruirSesionesDeUsuario(user.id);
  await crearSesion(user.id, await userAgent());

  await registrarAuditoria({
    actorUserId: user.id,
    actorRole: user.role,
    action: "auth.change_password",
    entityType: "User",
    entityId: user.id,
  });

  return { ok: true, redirectTo: user.role === "STUDENT" ? "/alumno" : "/admin" };
}

// ---------------------------------------------------------------------------
// Recuperación de contraseña ("olvidé mi contraseña")
// ---------------------------------------------------------------------------

const MENSAJE_RECUPERACION_GENERICO = "Si el email existe en el sistema, enviamos instrucciones para recuperar la contraseña.";
const DURACION_TOKEN_MS = 60 * 60 * 1000; // 1 hora

export async function requestPasswordResetAction(
  email: string,
): Promise<{ ok: true; message: string } | { ok: false; error: string }> {
  const correo = email.trim().toLowerCase();
  const clave = `reset:${await ip()}:${correo}`;
  if (!permitir(clave, 3, 15 * 60 * 1000)) return { ok: false, error: MENSAJE_RATE_LIMIT };

  const user = await prisma.user.findUnique({ where: { email: correo } });

  // Mismo mensaje exista o no la cuenta: no se revela si un email está registrado.
  if (user && user.isActive) {
    const token = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + DURACION_TOKEN_MS) },
    });

    const link = `${await origen()}/restablecer?token=${token}`;
    await sendEmail({
      to: user.email,
      subject: "Recuperar contraseña · Graan Studio",
      text: `Para elegir una nueva contraseña, entrá a este link (vence en 1 hora):\n${link}\n\nSi no lo pediste vos, ignorá este mensaje.`,
    });

    await registrarAuditoria({
      actorUserId: user.id,
      actorRole: user.role,
      action: "auth.request_password_reset",
      entityType: "User",
      entityId: user.id,
    });
  }

  return { ok: true, message: MENSAJE_RECUPERACION_GENERICO };
}

export async function resetPasswordAction(token: string, newPassword: string): Promise<ActionResult<{ redirectTo: string }>> {
  if (!passwordEsValida(newPassword)) return { ok: false, error: "La contraseña debe tener al menos 8 caracteres." };

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const registro = await prisma.passwordResetToken.findUnique({ where: { tokenHash }, include: { user: true } });

  if (!registro || registro.usedAt || registro.expiresAt < new Date()) {
    return { ok: false, error: "El enlace no es válido o venció. Pedí uno nuevo." };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: registro.userId },
      data: { passwordHash: hashPassword(newPassword), mustChangePassword: false },
    }),
    prisma.passwordResetToken.update({ where: { id: registro.id }, data: { usedAt: new Date() } }),
  ]);
  await destruirSesionesDeUsuario(registro.userId);

  await registrarAuditoria({
    actorUserId: registro.userId,
    actorRole: registro.user.role,
    action: "auth.reset_password",
    entityType: "User",
    entityId: registro.userId,
  });

  return { ok: true, redirectTo: registro.user.role === "STUDENT" ? "/login" : "/admin/login" };
}
