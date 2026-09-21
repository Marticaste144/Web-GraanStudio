import { AdminHeader, Metrica } from "@/components/admin/AdminUI";
import { AlumnosLista } from "@/components/admin/AlumnosLista";
import { ALUMNAS, ALUMNAS_ACTIVAS, PAGOS_PENDIENTES } from "@/lib/data/admin";

export const metadata = { title: "Alumnos · Administración Graan Studio" };

export default function AdminAlumnos() {
  const tres = ALUMNAS.filter((a) => a.clasesPorSemana === 3).length;
  return (
    <main className="mx-auto max-w-[90rem] px-4 pb-16 pt-8 sm:px-8 lg:px-10 lg:pt-12">
      <AdminHeader titulo="Alumnos" subtitulo="Quiénes cursan en el estudio y cómo está su cuota." />

      <div className="mt-8 grid gap-4 min-[560px]:grid-cols-3 lg:gap-5">
        <Metrica etiqueta="Alumnas activas" valor={String(ALUMNAS_ACTIVAS)} nota="con al menos una clase semanal" />
        <Metrica etiqueta="Cuota pendiente" valor={String(PAGOS_PENDIENTES.length)} nota="alumnas por regularizar" tono="sage" />
        <Metrica etiqueta="Plan de 3 clases" valor={String(tres)} nota="alumnas con el plan más completo" />
      </div>

      <div className="mt-5 lg:mt-6">
        <AlumnosLista alumnas={ALUMNAS} />
      </div>
    </main>
  );
}
