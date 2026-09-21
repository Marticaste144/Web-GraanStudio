import { CuotaVista } from "@/components/alumno/CuotaVista";
import { DIAS_HASTA_VENCIMIENTO } from "@/lib/data/alumna";
import { fechaEnDias, mesActual } from "@/lib/fechas";

// Depende de la fecha actual: se calcula en cada visita.
export const dynamic = "force-dynamic";

export default function CuotaPage() {
  return <CuotaVista mes={mesActual()} vence={fechaEnDias(DIAS_HASTA_VENCIMIENTO)} />;
}
