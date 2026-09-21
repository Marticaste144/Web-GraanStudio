import { notFound } from "next/navigation";
import { FichaAlumna } from "@/components/admin/FichaAlumna";
import { getAlumna } from "@/lib/data/admin";
import { DIAS_HASTA_VENCIMIENTO } from "@/lib/data/alumna";
import { asistenciaDe, historialDe } from "@/lib/data/ficha";
import { fechaCortaEnDias, fechaEnDias, fechaEnDiasProximoMes, mesHace, resolverDia } from "@/lib/fechas";

// Las fechas dependen del día actual: se calculan en cada visita.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const alumna = getAlumna(Number((await params).id));
  return { title: `${alumna ? `${alumna.nombre} ${alumna.apellido}` : "Alumna"} · Administración Graan Studio` };
}

export default async function FichaAlumnaPage({ params }: { params: Promise<{ id: string }> }) {
  const alumna = getAlumna(Number((await params).id));
  if (!alumna) notFound();

  const hoy = resolverDia();

  const historial = historialDe(alumna).map((p) => ({
    mes: mesHace(p.mesesAtras),
    fecha: fechaCortaEnDias(-p.hace),
    monto: p.monto,
    medio: p.medio,
    estado: p.estado,
  }));

  // Vencimiento de ejemplo: con la cuota pendiente, el mismo que ve la alumna en su portal;
  // con la cuota al día, el del mes siguiente. (La regla real de vencimientos se define más adelante.)
  const vence =
    alumna.estado === "Pendiente" ? fechaEnDias(DIAS_HASTA_VENCIMIENTO) : fechaEnDiasProximoMes(DIAS_HASTA_VENCIMIENTO);

  return (
    <FichaAlumna
      alumna={alumna}
      hoyDia={hoy.dia}
      hoyHora={hoy.hora}
      historial={historial}
      vence={vence}
      asistencia={asistenciaDe(alumna)}
    />
  );
}
