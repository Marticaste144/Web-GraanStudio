import { notFound } from "next/navigation";
import { FichaAlumnaReal } from "@/components/admin/FichaAlumnaReal";
import { prisma } from "@/lib/prisma";
import { calcularResumenPack } from "@/lib/packs/calculos";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const alumna = await prisma.alumna.findUnique({ where: { id } });
  return { title: `${alumna ? `${alumna.nombre} ${alumna.apellido}` : "Alumna"} · Administración Graan Studio` };
}

export default async function FichaAlumnaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [alumna, senasDb, planPacks] = await Promise.all([
    prisma.alumna.findUnique({
      where: { id },
      include: {
        comprasPack: { orderBy: [{ fechaInicio: "desc" }, { createdAt: "desc" }], include: { planPack: true, pagos: { orderBy: { createdAt: "desc" } } } },
      },
    }),
    prisma.sena.findMany({ where: { alumnaId: id }, orderBy: { createdAt: "desc" }, include: { compraPack: true } }),
    prisma.planPack.findMany({ where: { activo: true }, orderBy: { clases: "asc" } }),
  ]);

  if (!alumna) notFound();

  const senaAplicadaPorCompra = new Map(
    senasDb.filter((s) => s.estado === "APLICADA" && s.compraPackId).map((s) => [s.compraPackId as string, s]),
  );

  return (
    <FichaAlumnaReal
      alumna={{
        id: alumna.id, nombre: alumna.nombre, apellido: alumna.apellido,
        telefono: alumna.telefono, dni: alumna.dni, email: alumna.email,
        disciplinas: alumna.disciplinas, diasHorarios: alumna.diasHorarios, activa: alumna.activa,
      }}
      comprasPack={alumna.comprasPack.map((c) => {
        const senaAplicada = senaAplicadaPorCompra.get(c.id) ?? null;
        const resumen = calcularResumenPack(c, c.pagos, senaAplicada ? { monto: senaAplicada.monto } : null);
        return {
          id: c.id, clasesContratadas: c.clasesContratadas, precioAplicado: c.precioAplicado,
          fechaInicio: c.fechaInicio.toISOString(), fechaFin: c.fechaFin?.toISOString() ?? null,
          clasesTomadas: c.clasesTomadas, clasesRestantes: c.clasesRestantes, estado: c.estado,
          planNombre: c.planPack ? `Plan de ${c.planPack.clases} clases` : "Pack personalizado",
          pagos: c.pagos.map((p) => ({ id: p.id, monto: p.monto, medio: p.medio, fechaPago: p.fechaPago?.toISOString() ?? null })),
          senaAplicada: senaAplicada ? { id: senaAplicada.id, monto: senaAplicada.monto } : null,
          resumen,
        };
      })}
      senas={senasDb.map((s) => ({
        id: s.id, monto: s.monto, medio: s.medio, fecha: s.fecha.toISOString(), estado: s.estado,
        compraPackId: s.compraPackId,
        compraPackResumen: s.compraPack ? `${s.compraPack.clasesContratadas} clases · ${s.compraPack.fechaInicio.toISOString().slice(0, 10)}` : null,
      }))}
      planPacks={planPacks.map((p) => ({ id: p.id, clases: p.clases, precio: p.precio }))}
    />
  );
}
