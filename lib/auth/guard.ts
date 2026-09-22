import "server-only";

import { redirect } from "next/navigation";
import type { User } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/current-user";
import { can, type Permiso } from "@/lib/auth/rbac";

interface GuardOptions {
  /** A dónde mandar si no hay sesión. */
  unauthenticatedRedirect: string;
  /** A dónde mandar si hay sesión pero el rol no tiene el permiso pedido. */
  unauthorizedRedirect: string;
}

/**
 * Protección server-side reutilizable para Server Components (layouts/páginas) y, más adelante,
 * para Server Actions. La fuente de verdad es siempre la sesión en base de datos: nunca se confía
 * en un rol/id mandado por el cliente.
 */
export async function requireRole(permiso: Permiso, opts: GuardOptions): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(opts.unauthenticatedRedirect);
  if (!can(user.role, permiso)) redirect(opts.unauthorizedRedirect);
  if (user.mustChangePassword) redirect("/cambiar-contrasena");
  return user;
}

/** Cualquier usuario autenticado, sin importar el rol (ej. /cambiar-contrasena). */
export async function requireAnyUser(unauthenticatedRedirect: string): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(unauthenticatedRedirect);
  return user;
}
