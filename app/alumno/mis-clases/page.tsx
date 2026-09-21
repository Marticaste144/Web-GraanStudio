import { MisClasesLista } from "@/components/alumno/MisClasesLista";
import { PageHeader } from "@/components/alumno/PageHeader";

export default function MisClasesPage() {
  return (
    <main>
      <PageHeader titulo="Mis clases" subtitulo="Los horarios fijos a los que estás anotada." />
      <MisClasesLista />
    </main>
  );
}
