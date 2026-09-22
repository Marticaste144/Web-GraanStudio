import "server-only";

import { cache } from "react";
import { leerSesion } from "@/lib/auth/session";

/**
 * Usuario autenticado según la cookie de sesión, validado contra la base de datos
 * (nunca contra algo enviado por el cliente). `cache()` evita repetir la consulta
 * si varias partes del árbol de Server Components la piden en el mismo request.
 */
export const getCurrentUser = cache(async () => {
  const session = await leerSesion();
  return session?.user ?? null;
});
