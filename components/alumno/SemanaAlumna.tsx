"use client";

import Link from "next/link";
import { getActividad } from "@/lib/data/actividades";
import { DIAS, type Dia } from "@/lib/data/horarios";
import { useAlumno } from "./AlumnoProvider";

/** Resumen de la semana: qué clases tiene la alumna cada día. */
export function SemanaAlumna({ hoy }: { hoy: Dia }) {
  const { misClases } = useAlumno();

  const porDia = DIAS.map((d) => ({
    dia: d,
    clases: misClases.filter((c) => c.dia === d.id).sort((a, b) => a.hora.localeCompare(b.hora)),
  }));

  return (
    <section aria-label="Tu semana" className="h-full rounded-3xl border border-line bg-paper p-6 sm:p-8">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-2xl text-taupe-dark sm:text-3xl">Tu semana</h2>
        <Link href="/alumno/mis-clases" className="text-xs tracking-wide text-taupe underline underline-offset-4">
          Ver todas
        </Link>
      </div>

      {/* Celular: una fila por día */}
      <ul className="mt-5 divide-y divide-line sm:hidden">
        {porDia.map(({ dia, clases }) => (
          <li key={dia.id} className="flex items-center gap-4 py-3">
            <span
              className={`w-10 shrink-0 text-xs font-medium uppercase tracking-[0.15em] ${
                dia.id === hoy ? "text-taupe-dark" : "text-ink-soft"
              }`}
            >
              {dia.corto}
            </span>
            {clases.length > 0 ? (
              <span className="flex-1 space-y-1">
                {clases.map((c) => (
                  <span key={c.hora} className="flex items-baseline gap-3">
                    <span className="font-serif text-xl leading-none text-taupe-dark">{c.hora}</span>
                    <span className="text-sm text-ink">{getActividad(c.actividad).nombre}</span>
                  </span>
                ))}
              </span>
            ) : (
              <span className="text-sm text-ink-soft/60">—</span>
            )}
          </li>
        ))}
      </ul>

      {/* Tablet y escritorio: cinco columnas */}
      <div className="mt-6 hidden grid-cols-5 gap-3 sm:grid">
        {porDia.map(({ dia, clases }) => {
          const esHoy = dia.id === hoy;
          return (
            <div key={dia.id}>
              <p
                className={`border-b pb-2 text-xs font-medium uppercase tracking-[0.18em] ${
                  esHoy ? "border-taupe-dark text-taupe-dark" : "border-line text-ink-soft"
                }`}
              >
                {dia.corto}
              </p>
              <div className="mt-3 space-y-2">
                {clases.length > 0 ? (
                  clases.map((c) => (
                    <div
                      key={c.hora}
                      className={`rounded-xl p-3 ${esHoy ? "bg-taupe-dark text-cream" : "bg-cream-alt text-ink"}`}
                    >
                      <p className="font-serif text-xl leading-none">{c.hora}</p>
                      <p className={`mt-1.5 text-[0.7rem] leading-snug ${esHoy ? "text-cream/80" : "text-ink-soft"}`}>
                        {getActividad(c.actividad).nombre}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="px-1 py-3 text-sm text-ink-soft/50">—</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
