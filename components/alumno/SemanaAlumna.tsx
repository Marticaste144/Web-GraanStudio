"use client";

import { getActividad } from "@/lib/data/actividades";
import { claveClase, DIAS, type Dia } from "@/lib/data/horarios";
import { useAlumno } from "./AlumnoProvider";

/** Cronograma semanal completo de la alumna: qué clases tiene cada día. */
export function SemanaAlumna({ hoy }: { hoy: Dia }) {
  const { misClases, anotadasAhora, usuario } = useAlumno();

  const porDia = DIAS.map((d) => ({
    dia: d,
    clases: misClases.filter((c) => c.dia === d.id).sort((a, b) => a.hora.localeCompare(b.hora)),
  }));
  const esNueva = (dia: Dia, hora: string) => !usuario.esNueva && anotadasAhora.has(claveClase(dia, hora));

  const Nueva = () => (
    <span className="pop rounded-full bg-sage-deep px-2 py-0.5 text-[0.6rem] font-medium uppercase tracking-wider text-white">
      Nueva
    </span>
  );

  return (
    <section aria-label="Cronograma semanal" className="rounded-3xl border border-line bg-paper p-5 sm:p-7">
      {/* Celular: una fila por día */}
      <ul className="divide-y divide-line sm:hidden">
        {porDia.map(({ dia, clases }) => (
          <li key={dia.id} className="flex items-start gap-4 py-3.5">
            <span
              className={`w-11 shrink-0 pt-1 text-xs font-medium uppercase tracking-[0.15em] ${
                dia.id === hoy ? "text-sage-deep" : "text-ink-soft"
              }`}
            >
              {dia.corto}
            </span>
            {clases.length > 0 ? (
              <span className="min-w-0 flex-1 space-y-2">
                {clases.map((c) => (
                  <span key={c.hora} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-serif text-2xl leading-none text-taupe-dark">{c.hora}</span>
                    <span className="text-sm text-ink">{getActividad(c.actividad).nombre}</span>
                    {esNueva(c.dia, c.hora) && <Nueva />}
                  </span>
                ))}
              </span>
            ) : (
              <span className="pt-1 text-sm text-ink-soft/60">Sin clases</span>
            )}
          </li>
        ))}
      </ul>

      {/* Tablet y escritorio: una columna por día */}
      <div className="hidden grid-cols-5 gap-3 sm:grid lg:gap-4">
        {porDia.map(({ dia, clases }) => {
          const esHoy = dia.id === hoy;
          return (
            <div key={dia.id} className="min-w-0">
              <p
                className={`border-b-2 pb-2 text-xs font-medium uppercase tracking-[0.18em] ${
                  esHoy ? "border-sage-deep text-sage-deep" : "border-line text-ink-soft"
                }`}
              >
                {dia.nombre}
                {esHoy && <span className="ml-2 normal-case tracking-normal">· hoy</span>}
              </p>
              <div className="mt-3 space-y-2.5">
                {clases.length > 0 ? (
                  clases.map((c) => (
                    <div
                      key={c.hora}
                      className={`rounded-2xl p-3.5 ${esHoy ? "bg-taupe-dark text-cream" : "bg-cream-alt text-ink"}`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                        <p className="font-serif text-2xl leading-none">{c.hora}</p>
                        {esNueva(c.dia, c.hora) && <Nueva />}
                      </div>
                      <p className={`mt-2 text-xs leading-snug ${esHoy ? "text-cream/85" : "text-ink-soft"}`}>
                        {getActividad(c.actividad).nombre}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-2xl border border-dashed border-line px-3 py-4 text-center text-xs text-ink-soft/70">
                    Sin clases
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
