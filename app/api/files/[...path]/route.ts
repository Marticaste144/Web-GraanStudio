import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { leerArchivo } from "@/lib/storage";

// Ruta autenticada para servir archivos privados (comprobantes, etc). Nunca hay una URL pública
// permanente: cada pedido revalida sesión, rol y pertenencia antes de leer del storage.
// Todavía no hay flujo de carga de comprobantes (bloque futuro); esta ruta ya deja resuelta la
// autorización para cuando exista.

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const { path } = await params;
  const storageKey = path.join("/");

  const comprobante = await prisma.comprobante.findUnique({
    where: { storageKey },
    include: { alumna: true },
  });
  if (!comprobante) return NextResponse.json({ error: "No encontrado." }, { status: 404 });

  const esPropia = user.role === "STUDENT" && comprobante.alumna.userId === user.id;
  const esStaff = user.role === "OWNER" || user.role === "ADMIN";
  if (!esPropia && !esStaff) return NextResponse.json({ error: "No autorizado." }, { status: 403 });

  const archivo = await leerArchivo(storageKey);
  if (!archivo) return NextResponse.json({ error: "No encontrado." }, { status: 404 });

  return new NextResponse(new Uint8Array(archivo.data), {
    headers: { "Content-Type": archivo.contentType, "Cache-Control": "private, no-store" },
  });
}
