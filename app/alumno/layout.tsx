import { AlumnoShell } from "@/components/alumno/AlumnoShell";
import { requireRole } from "@/lib/auth/guard";

export default async function AlumnoLayout({ children }: { children: React.ReactNode }) {
  // Protección real del lado servidor (además del middleware): sin sesión válida con rol
  // STUDENT no se llega a renderizar nada del portal.
  await requireRole("alumno:access", { unauthenticatedRedirect: "/login", unauthorizedRedirect: "/" });

  return <AlumnoShell>{children}</AlumnoShell>;
}
