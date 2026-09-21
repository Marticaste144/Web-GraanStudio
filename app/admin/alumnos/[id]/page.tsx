import { notFound } from "next/navigation";
import { FichaAlumna } from "@/components/admin/FichaAlumna";
import { getActividad } from "@/lib/data/actividades";
import { DIAS_HASTA_VENCIMIENTO } from "@/lib/data/alumna";
import { asistenciaDe, clasesDeAlumna, getAlumna, historialDe } from "@/lib/data/ficha";
import { nombreDia } from "@/lib/data/horarios";
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
  const orden = (dia: string, hora: string | number) =>
    ["lunes", "martes", "miercoles", "jueves", "viernes"].indexOf(dia) * 100 + parseInt(String(hora));
  const ahora = orden(hoy.dia, hoy.hora);

  const clasesAlumna = clasesDeAlumna(alumna);
  // La "próxima" es la primera desde ahora; si ya no quedan esta semana, la primera de la siguiente.
  const proxima = clasesAlumna.find((c) => orden(c.dia, c.hora) >= ahora) ?? clasesAlumna[0];
  const clases = clasesAlumna.map((c) => ({
    dia: nombreDia(c.dia),
    hora: c.hora,
    actividad: getActividad(c.actividad).nombre,
    esProxima: proxima === c,
  }));

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

  return <FichaAlumna alumna={alumna} clases={clases} historial={historial} vence={vence} asistencia={asistenciaDe(alumna)} />;
}
