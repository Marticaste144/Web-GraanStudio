import { AdminHeader } from "@/components/admin/AdminUI";
import { PagosLista } from "@/components/admin/PagosLista";
import { PAGOS } from "@/lib/data/admin";
import { fechaCortaEnDias, mesActual } from "@/lib/fechas";

// Las fechas dependen del día actual: se calculan en cada visita.
export const dynamic = "force-dynamic";

// ?q=Nombre Apellido llega desde la ficha de alumna ("Ver pagos") y deja la lista filtrada.
export default async function AdminPagos({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const pagos = PAGOS.map((p) => ({ ...p, fecha: fechaCortaEnDias(-p.hace) }));
  return (
    <main className="mx-auto max-w-[90rem] px-4 pb-16 pt-8 sm:px-8 lg:px-10 lg:pt-12">
      <AdminHeader titulo="Pagos" subtitulo={`Cuotas de ${mesActual()}. Aprobá los comprobantes que van llegando.`} />
      <PagosLista pagos={pagos} busquedaInicial={q ?? ""} />
    </main>
  );
}
