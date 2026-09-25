import { notFound } from "next/navigation";
import { DetalleOcurrenciaVista } from "@/components/admin/DetalleOcurrenciaVista";
import { detalleOcurrencia } from "@/lib/grilla/consulta";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const o = await detalleOcurrencia(id);
  return { title: o ? `${o.disciplinaNombre} · ${o.hora} · Administración Graan Studio` : "Clase · Administración Graan Studio" };
}

export default async function DetalleOcurrenciaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [ocurrencia, profesoras] = await Promise.all([
    detalleOcurrencia(id),
    prisma.profesora.findMany({ where: { activa: true }, orderBy: { nombre: "asc" } }),
  ]);
  if (!ocurrencia) notFound();

  return (
    <DetalleOcurrenciaVista
      ocurrencia={{
        ...ocurrencia,
        fecha: ocurrencia.fecha.toISOString(),
        lugares: ocurrencia.lugares.map((l) => ({ ...l, avisoFecha: l.avisoFecha ? l.avisoFecha.toISOString() : null })),
      }}
      profesoras={profesoras.map((p) => ({ id: p.id, nombre: p.nombre }))}
    />
  );
}
