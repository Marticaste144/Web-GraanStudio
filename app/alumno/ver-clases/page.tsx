import { PageHeader } from "@/components/alumno/PageHeader";
import { VerClases } from "@/components/alumno/VerClases";

export default function VerClasesPage() {
  return (
    <main>
      <PageHeader
        titulo="Ver clases"
        subtitulo="Todo lo que se dicta en el estudio. Al anotarte, quedás en ese horario todas las semanas."
        volverA="/alumno/mis-clases"
        volverLabel="Mis clases"
      />
      <VerClases />
    </main>
  );
}
