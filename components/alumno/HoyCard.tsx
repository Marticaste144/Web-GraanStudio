"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { getActividad } from "@/lib/data/actividades";
import { ESTUDIO } from "@/lib/data/estudio";
import { DIAS, nombreDia, type Clase, type Dia } from "@/lib/data/horarios";
import { useAlumno } from "./AlumnoProvider";

const orden = (c: Clase) => DIAS.findIndex((d) => d.id === c.dia) * 100 + parseInt(c.hora);

/** Vista rápida de la clase de hoy. Solo informativa. */
export function HoyCard({ dia, etiqueta }: { dia: Dia; etiqueta: string }) {
  const { misClases } = useAlumno();
  const deHoy = misClases.filter((c) => c.dia === dia).sort((a, b) => orden(a) - orden(b));

  const hoyIdx = DIAS.findIndex((d) => d.id === dia) * 100;
  const ordenadas = [...misClases].sort((a, b) => orden(a) - orden(b));
  const proxima = ordenadas.find((c) => orden(c) > hoyIdx + 99) ?? ordenadas[0];

  return (
    <section
      aria-label="Clase de hoy"
      className="flex h-full flex-col justify-between rounded-3xl bg-taupe-dark p-6 text-cream sm:p-8 lg:p-10"
    >
      <p className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-sage">Hoy · {etiqueta}</p>

      {deHoy.length > 0 ? (
        <div className="mt-6 space-y-6">
          {deHoy.map((c) => (
            <div key={c.hora} className="flex flex-wrap items-end gap-x-6 gap-y-1">
              <span className="font-serif text-6xl leading-none sm:text-7xl lg:text-8xl">{c.hora}</span>
              <p className="pb-1 font-serif text-2xl italic leading-tight sm:text-3xl">
                {getActividad(c.actividad).nombre}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <p className="font-serif text-4xl leading-tight sm:text-5xl">
            {misClases.length === 0 ? "Empezá cuando quieras" : "Hoy descansás"}
          </p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-cream/75">
            {misClases.length === 0 ? (
              <>
                Todavía no tenés clases. Mirá los horarios disponibles y elegí tus días.{" "}
                <Link href="/alumno/ver-clases" className="underline underline-offset-4">
                  Ver clases
                </Link>
              </>
            ) : (
              proxima && (
                <>
                  Tu próxima clase es el {nombreDia(proxima.dia)} a las {proxima.hora}:{" "}
                  {getActividad(proxima.actividad).nombre}.
                </>
              )
            )}
          </p>
        </div>
      )}

      <p className="mt-8 flex items-start gap-2 border-t border-cream/20 pt-5 text-xs leading-relaxed text-cream/75">
        <MapPin size={14} className="mt-0.5 shrink-0" />
        {ESTUDIO.direccion.lugar} · {ESTUDIO.direccion.detalle}
      </p>
    </section>
  );
}
