"use client";

import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import type { Dia } from "@/lib/data/horarios";
import { useAlumno } from "./AlumnoProvider";
import { PageHeader } from "./PageHeader";
import { SemanaAlumna } from "./SemanaAlumna";

/** Mis clases: el cronograma completo de la alumna. */
export function MisClasesVista({ hoy }: { hoy: Dia }) {
  const { misClases, plan } = useAlumno();

  return (
    <main>
      <PageHeader
        eyebrow="Mis clases"
        titulo="Tus clases semanales"
        subtitulo={misClases.length > 0 ? "Tu cronograma de lunes a viernes." : undefined}
        accion={
          <Link href="/alumno/ver-clases" className="btn btn-outline hidden sm:inline-flex">
            <Plus size={16} />
            Reservar otra clase
          </Link>
        }
      />

      {misClases.length > 0 ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-12 lg:gap-5">
          <div className="lg:col-span-9">
            <SemanaAlumna hoy={hoy} />
          </div>
          <aside className="lg:col-span-3">
            <div className="rounded-3xl bg-taupe-dark p-5 text-cream sm:p-6 lg:sticky lg:top-28">
              <p className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-sage">Tu plan</p>
              <p className="mt-2 font-serif text-2xl leading-tight">{plan ? plan.nombre : "Sin clases"}</p>
              <p className="mt-2 text-sm leading-relaxed text-cream/80">
                ¿Querés sumar otro día? Elegí el horario y quedás anotada.
              </p>
              <Link href="/alumno/ver-clases" className="btn mt-5 w-full bg-cream text-taupe-dark hover:bg-cream-alt">
                Ver clases disponibles
                <ArrowRight size={16} />
              </Link>
            </div>
          </aside>
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-taupe/40 bg-paper p-8 text-center sm:p-12">
          <p className="font-serif text-3xl text-taupe-dark">Todavía no tenés clases</p>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
            Elegí los días y horarios que mejor te queden y aparecen acá.
          </p>
          <Link href="/alumno/ver-clases" className="btn btn-primary mt-6">
            Ver clases disponibles
          </Link>
        </div>
      )}
    </main>
  );
}
