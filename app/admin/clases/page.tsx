import { AdminHeader, Metrica } from "@/components/admin/AdminUI";
import { ClasesGrilla } from "@/components/admin/ClasesGrilla";
import { OCUPACION_PROMEDIO } from "@/lib/data/admin";
import { CAPACIDAD, ocupadasDe } from "@/lib/data/cupos";
import { TODAS_LAS_CLASES } from "@/lib/data/horarios";

export const metadata = { title: "Clases · Administración Graan Studio" };

export default function AdminClases() {
  const completas = TODAS_LAS_CLASES.filter((c) => ocupadasDe(c) >= CAPACIDAD).length;
  return (
    <main className="mx-auto max-w-[90rem] px-4 pb-16 pt-8 sm:px-8 lg:px-10 lg:pt-12">
      <AdminHeader titulo="Clases" subtitulo="La semana del estudio y la ocupación de cada horario." />

      <div className="mt-8 grid gap-4 min-[560px]:grid-cols-3 lg:gap-5">
        <Metrica etiqueta="Clases por semana" valor={String(TODAS_LAS_CLASES.length)} nota="de lunes a viernes" />
        <Metrica etiqueta="Clases completas" valor={String(completas)} nota={`con ${CAPACIDAD}/${CAPACIDAD} anotadas`} tono="sage" />
        <Metrica etiqueta="Ocupación promedio" valor={`${OCUPACION_PROMEDIO}%`} nota="de todos los horarios" />
      </div>

      <div className="mt-5 lg:mt-6">
        <ClasesGrilla />
      </div>
    </main>
  );
}
