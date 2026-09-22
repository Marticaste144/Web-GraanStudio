import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { can, type Permiso } from "@/lib/auth/rbac";

// Proxy de Next.js (reemplaza a "middleware" desde Next 16, ya corre en runtime Node.js):
// permite consultar la base de datos acá mismo, así la protección de /admin y /alumno es real
// del lado servidor y no depende de que cada página se acuerde de llamar al guard (que además
// se vuelve a chequear en los layouts como defensa en profundidad).
export const config = {
  matcher: ["/admin/:path*", "/alumno/:path*"],
};

const SESSION_COOKIE = "graan_session";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // La propia página de login de administración no puede quedar detrás del login de administración.
  if (pathname === "/admin/login") return NextResponse.next();

  const esAdmin = pathname.startsWith("/admin");
  const permiso: Permiso = esAdmin ? "admin:access" : "alumno:access";
  const loginPath = esAdmin ? "/admin/login" : "/login";

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  let autorizado = false;

  if (token) {
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const session = await prisma.session.findUnique({ where: { tokenHash }, include: { user: true } });
    autorizado = Boolean(
      session && session.expiresAt > new Date() && session.user.isActive && can(session.user.role, permiso),
    );
  }

  if (!autorizado) {
    const url = req.nextUrl.clone();
    url.pathname = loginPath;
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
