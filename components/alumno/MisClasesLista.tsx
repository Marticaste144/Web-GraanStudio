"use client";

import Link from "next/link";
import { ArrowRight, Repeat } from "lucide-react";
import { ActividadIcon } from "@/components/ui/ActividadIcon";
import { getActividad } from "@/lib/data/actividades";
import { claveClase, DIAS, nombreDia, type Clase } from "@/lib/data/horarios";
import { useAlumno } from "./AlumnoProvider";

const orden = (c: Clase) => DIAS.findIndex((d) => d.id === c.dia) * 100 + parseInt(c.hora);

export function MisClasesLista() {
  const { misClases, nuevas } = useAlumno();
  const clases = [...misClases].sort((a, b) => orden(a) - orden(b));

  return (
    <>
      <ul className="mt-6 space-y-3 px-5">
        {clases.map((c) => {
          const act = getActividad(c.actividad);
          const esNueva = nuevas.has(claveClase(c.dia, c.hora));
          return (
            <li
              key={claveClase(c.dia, c.hora)}
              className="flex items-center gap-4 rounded-2xl border border-line bg-paper p-4"
            >
              <div className="w-[4.5rem] shrink-0 border-r border-line pr-4 text-center">
                <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-taupe">
                  {nombreDia(c.dia).slice(0, 3)}
                </p>
                <p className="font-serif text-3xl leading-none text-taupe-dark">{c.hora}</p>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-serif text-2xl leading-tight text-taupe-dark">{act.nombre}</p>
                <p className="mt-1 text-xs text-ink-soft">{nombreDia(c.dia)} · todas las semanas</p>
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

      <p className="mx-5 mt-5 flex items-start gap-2 text-xs leading-relaxed text-ink-soft">
        <Repeat size={14} className="mt-0.5 shrink-0 text-sage-dark" />
        Estos son tus horarios fijos: venís a la misma clase todas las semanas mientras estés anotada.
      </p>

      <div className="px-5 pt-8">
        <Link href="/alumno/ver-clases" className="btn btn-primary w-full">
          Ver clases disponibles
          <ArrowRight size={16} />
        </Link>
      </div>
    </>
  );
}
