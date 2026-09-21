"use client";

import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { ActividadIcon } from "@/components/ui/ActividadIcon";
import { getActividad } from "@/lib/data/actividades";
import { claveClase, DIAS, nombreDia, type Clase } from "@/lib/data/horarios";
import { useAlumno } from "./AlumnoProvider";
import { PageHeader } from "./PageHeader";
import { SemanaAlumna } from "./SemanaAlumna";
import type { Dia } from "@/lib/data/horarios";

const orden = (c: Clase) => DIAS.findIndex((d) => d.id === c.dia) * 100 + parseInt(c.hora);

export function MisClasesVista({ hoy }: { hoy: Dia }) {
  const { misClases, anotadasAhora, usuario, plan } = useAlumno();
  const clases = [...misClases].sort((a, b) => orden(a) - orden(b));

  return (
    <main>
      <PageHeader
        eyebrow="Mis clases"
        titulo="Tus clases semanales"
        accion={
          <Link href="/alumno/ver-clases" className="btn btn-outline hidden sm:inline-flex">
            <Plus size={16} />
            Reservar otra clase
          </Link>
        }
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-12 lg:gap-8">
        <section className="lg:col-span-8" aria-label="Listado de clases">
          {clases.length > 0 ? (
            <ul className="grid gap-4 sm:grid-cols-2">
              {clases.map((c) => {
                const act = getActividad(c.actividad);
                const esNueva = !usuario.esNueva && anotadasAhora.has(claveClase(c.dia, c.hora));
                return (
                  <li
                    key={claveClase(c.dia, c.hora)}
                    className="flex items-center gap-5 rounded-2xl border border-line bg-paper p-5 sm:p-6"
                  >
                    <div className="w-20 shrink-0 border-r border-line pr-5 text-center">
                      <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-taupe">
                        {c.dia === "miercoles" ? "Mié" : nombreDia(c.dia).slice(0, 3)}
                      </p>
                      <p className="mt-1 font-serif text-3xl leading-none text-taupe-dark">{c.hora}</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-serif text-xl leading-tight text-taupe-dark sm:text-2xl">{act.nombre}</p>
                      <p className="mt-1 text-xs text-ink-soft">{nombreDia(c.dia)}</p>
                    </div>
                    {esNueva ? (
                      <span className="pop rounded-full bg-sage-soft px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-wider text-sage-dark">
                        Nueva
                      </span>
                    ) : (
                      <ActividadIcon icono={act.icono} size={22} className="shrink-0 text-sage-dark" />
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="rounded-3xl border border-dashed border-taupe/40 bg-paper p-8 text-center sm:p-12">
              <p className="font-serif text-3xl text-taupe-dark">Todavía no tenés clases</p>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
                Elegí los días y horarios que mejor te queden y quedan guardados en tu semana.
              </p>
            </div>
          )}
        </section>

        <aside className="lg:col-span-4">
          <div className="rounded-3xl bg-taupe-dark p-6 text-cream sm:p-8 lg:sticky lg:top-28">
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-sage">Tu plan</p>
            <p className="mt-3 font-serif text-3xl leading-tight">{plan ? plan.nombre : "Sin clases todavía"}</p>
            <p className="mt-3 text-sm leading-relaxed text-cream/75">
              Sumá más clases cuando quieras: elegís el día, el horario y quedás anotada.
            </p>
            <Link href="/alumno/ver-clases" className="btn mt-6 w-full bg-cream text-taupe-dark hover:bg-cream-alt">
              Ver clases disponibles
              <ArrowRight size={16} />
            </Link>
          </div>
        </aside>
      </div>

      {clases.length > 0 && (
        <div className="mt-6 lg:mt-8">
          <SemanaAlumna hoy={hoy} />
        </div>
      )}
    </main>
  );
}
