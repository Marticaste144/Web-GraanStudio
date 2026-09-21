import { CuotaVista } from "@/components/alumno/CuotaVista";
import { PageHeader } from "@/components/alumno/PageHeader";
import { CUOTA } from "@/lib/data/alumna";
import { fechaEnDias, mesActual } from "@/lib/fechas";

// Depende de la fecha actual: se calcula en cada visita.
export const dynamic = "force-dynamic";

export default function CuotaPage() {
  return (
    <main>
      <PageHeader titulo="Mi cuota" subtitulo="Pagás una cuota mensual por tus horarios fijos." />
      <CuotaVista mes={mesActual()} vence={fechaEnDias(CUOTA.diasHastaVencimiento)} />
    </main>
  );
}
