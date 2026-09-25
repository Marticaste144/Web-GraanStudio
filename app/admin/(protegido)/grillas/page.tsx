import { GrillaSemanal, type OcurrenciaResumenVista } from "@/components/admin/GrillaSemanal";
import { asegurarOcurrenciasDeSemana } from "@/lib/grilla/ocurrencias";
import { semanaGrilla } from "@/lib/grilla/consulta";
import { inicioSemana, sumarDias, DIAS_SEMANA } from "@/lib/grilla/semana";

export const metadata = { title: "Grillas · Administración Graan Studio" };
export const dynamic = "force-dynamic";

export default async function AdminGrillas({ searchParams }: { searchParams: Promise<{ semana?: string }> }) {
  const { semana } = await searchParams;
  const fechaPedida = semana ? new Date(`${semana}T00:00:00Z`) : new Date();
  const lunes = inicioSemana(isNaN(fechaPedida.getTime()) ? new Date() : fechaPedida);

  const fechaISO = (d: Date) => d.toISOString().slice(0, 10);
  const esSemanaActual = lunes.getTime() === inicioSemana(new Date()).getTime();
  const propsComunes = {
    lunesISO: lunes.toISOString(),
    hrefAnterior: `/admin/grillas?semana=${fechaISO(sumarDias(lunes, -7))}`,
    hrefSiguiente: `/admin/grillas?semana=${fechaISO(sumarDias(lunes, 7))}`,
    hrefHoy: "/admin/grillas",
    esSemanaActual,
  };

  // Genera bajo demanda las ocurrencias de ESTA semana si todavía no existían (idempotente: no
  // duplica nada si ya estaban generadas). Si esto falla, no queremos que se vea como "no hay
  // clases" -- se distingue explícitamente de una semana genuinamente vacía.
  let totalRecurrentesActivas: number;
  try {
    const resultado = await asegurarOcurrenciasDeSemana(lunes);
    totalRecurrentesActivas = resultado.totalRecurrentesActivas;
  } catch {
    return <GrillaSemanal {...propsComunes} dias={null} error="No se pudo cargar la grilla de esta semana. Probá de nuevo en unos segundos." />;
  }

  if (totalRecurrentesActivas === 0) {
    return <GrillaSemanal {...propsComunes} dias={null} semanaVacia />;
  }

  let dias: Record<string, OcurrenciaResumenVista[]>;
  try {
    const semanaData = await semanaGrilla(lunes);
    dias = {};
    for (const dia of DIAS_SEMANA) {
      dias[dia] = semanaData[dia].map((o) => ({ ...o, fecha: o.fecha.toISOString() }));
    }
  } catch {
    return <GrillaSemanal {...propsComunes} dias={null} error="No se pudo cargar la grilla de esta semana. Probá de nuevo en unos segundos." />;
  }

  return <GrillaSemanal {...propsComunes} dias={dias} />;
}
