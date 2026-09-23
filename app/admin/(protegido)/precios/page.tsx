import { PreciosAdmin } from "@/components/admin/PreciosAdmin";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/guard";

export const metadata = { title: "Precios · Administración Graan Studio" };
export const dynamic = "force-dynamic";

export default async function AdminPrecios() {
  // Catálogo de precios vigentes: información financiera global, exclusiva de OWNER (mismo
  // permiso que ya protege Métricas).
  await requireRole("admin:financials", { unauthenticatedRedirect: "/admin/login", unauthorizedRedirect: "/admin" });

  const planes = await prisma.planPack.findMany({ orderBy: { clases: "asc" } });

  return <PreciosAdmin planes={planes.map((p) => ({ id: p.id, clases: p.clases, precio: p.precio, activo: p.activo }))} />;
}
