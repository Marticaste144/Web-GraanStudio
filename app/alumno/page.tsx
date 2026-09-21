import { InicioVista } from "@/components/alumno/InicioVista";
import { DIAS_HASTA_VENCIMIENTO } from "@/lib/data/alumna";
import { fechaEnDias, mesActual, resolverDia } from "@/lib/fechas";

// Depende de la fecha actual: se calcula en cada visita.
export const dynamic = "force-dynamic";

export default async function AlumnoInicio({ searchParams }: { searchParams: Promise<{ dia?: string }> }) {
  const { dia } = await searchParams;
  const hoy = resolverDia(dia);

  return (
    <InicioVista
      dia={hoy.dia}
      etiqueta={hoy.etiqueta}
      hora={hoy.hora}
      mes={mesActual()}
      vence={fechaEnDias(DIAS_HASTA_VENCIMIENTO)}
    />
  );
}
