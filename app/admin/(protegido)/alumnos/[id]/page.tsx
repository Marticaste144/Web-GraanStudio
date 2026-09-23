import { notFound } from "next/navigation";
import { FichaAlumnaReal } from "@/components/admin/FichaAlumnaReal";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const alumna = await prisma.alumna.findUnique({ where: { id } });
  return { title: `${alumna ? `${alumna.nombre} ${alumna.apellido}` : "Alumna"} · Administración Graan Studio` };
}

export default async function FichaAlumnaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [alumna, planPacks] = await Promise.all([
    prisma.alumna.findUnique({
      where: { id },
      include: {
        comprasPack: { orderBy: { fechaInicio: "desc" }, include: { planPack: true } },
        pagos: { orderBy: { createdAt: "desc" }, include: { compraPack: true } },
      },
    }),
    prisma.planPack.findMany({ where: { activo: true }, orderBy: { clases: "asc" } }),
  ]);

  if (!alumna) notFound();

  return (
    <FichaAlumnaReal
      alumna={{
        id: alumna.id, nombre: alumna.nombre, apellido: alumna.apellido,
        telefono: alumna.telefono, dni: alumna.dni, email: alumna.email,
        disciplinas: alumna.disciplinas, diasHorarios: alumna.diasHorarios, activa: alumna.activa,
      }}
      comprasPack={alumna.comprasPack.map((c) => ({
        id: c.id, clasesContratadas: c.clasesContratadas, precioAplicado: c.precioAplicado,
        fechaInicio: c.fechaInicio.toISOString(), fechaFin: c.fechaFin?.toISOString() ?? null,
        clasesTomadas: c.clasesTomadas, clasesRestantes: c.clasesRestantes, estado: c.estado,
        planNombre: c.planPack ? `${c.planPack.clases} clases (plan vigente)` : null,
      }))}
      pagos={alumna.pagos.map((p) => ({
        id: p.id, monto: p.monto, medio: p.medio, estado: p.estado,
        fechaPago: p.fechaPago?.toISOString() ?? null,
        compraPackResumen: p.compraPack ? `${p.compraPack.clasesContratadas} clases · ${p.compraPack.fechaInicio.toISOString().slice(0, 10)}` : null,
      }))}
      planPacks={planPacks.map((p) => ({ id: p.id, clases: p.clases, precio: p.precio }))}
    />
  );
}
