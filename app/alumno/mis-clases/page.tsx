import { MisClasesVista } from "@/components/alumno/MisClasesLista";
import { resolverDia } from "@/lib/fechas";

// Marca el día de hoy en la semana: depende de la fecha, se calcula en cada visita.
export const dynamic = "force-dynamic";

export default async function MisClasesPage({ searchParams }: { searchParams: Promise<{ dia?: string }> }) {
  const { dia } = await searchParams;
  return <MisClasesVista hoy={resolverDia(dia).dia} />;
}
