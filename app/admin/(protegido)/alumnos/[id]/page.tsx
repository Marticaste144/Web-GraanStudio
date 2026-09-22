import { notFound } from "next/navigation";
import { FichaAlumna } from "@/components/admin/FichaAlumna";
import { getAlumna, PRIMER_ID_ALTA_MANUAL } from "@/lib/data/admin";
import { resolverDia } from "@/lib/fechas";

// "Hoy" depende del día actual: se calcula en cada visita.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const alumna = getAlumna(Number((await params).id));
  return { title: `${alumna ? `${alumna.nombre} ${alumna.apellido}` : "Alumna"} · Administración Graan Studio` };
}

export default async function FichaAlumnaPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const alumna = getAlumna(id);
  // Los ids desde PRIMER_ID_ALTA_MANUAL son de alumnas dadas de alta en esta sesión del demo: el navegador las resuelve.
  if (!alumna && !(Number.isInteger(id) && id > PRIMER_ID_ALTA_MANUAL)) notFound();

  const hoy = resolverDia();
  return <FichaAlumna id={id} alumna={alumna ?? null} hoyDia={hoy.dia} hoyHora={hoy.hora} />;
}
