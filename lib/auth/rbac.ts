import type { Role } from "@prisma/client";

/**
 * Tabla central de permisos por rol. Cualquier chequeo de autorización nuevo (server action,
 * ruta, API) debería agregar un permiso acá en vez de comparar roles/emails a mano.
 */
const PERMISOS = {
  "admin:access": ["OWNER", "ADMIN"],
  /** Información financiera/global del negocio (ej. Métricas): exclusiva de la dueña. */
  "admin:financials": ["OWNER"],
  "alumno:access": ["STUDENT"],
} as const satisfies Record<string, readonly Role[]>;

export type Permiso = keyof typeof PERMISOS;

export function can(role: Role | null | undefined, permiso: Permiso): boolean {
  if (!role) return false;
  return (PERMISOS[permiso] as readonly Role[]).includes(role);
}

export function rolesConPermiso(permiso: Permiso): readonly Role[] {
  return PERMISOS[permiso];
}
