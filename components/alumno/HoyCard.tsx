"use client";

import { MapPin } from "lucide-react";
import { getActividad } from "@/lib/data/actividades";
import { DIAS, nombreDia, type Clase, type Dia } from "@/lib/data/horarios";
import { ESTUDIO } from "@/lib/data/estudio";
import { useAlumno } from "./AlumnoProvider";

const orden = (c: Clase) => DIAS.findIndex((d) => d.id === c.dia) * 100 + parseInt(c.hora);

/** Vista rápida de la clase de hoy. Solo informativa: no hay confirmar ni cancelar. */
export function HoyCard({ dia, etiqueta }: { dia: Dia; etiqueta: string }) {
  const { misClases } = useAlumno();
  const deHoy = misClases.filter((c) => c.dia === dia).sort((a, b) => orden(a) - orden(b));

  const hoyIdx = DIAS.findIndex((d) => d.id === dia) * 100;
  const ordenadas = [...misClases].sort((a, b) => orden(a) - orden(b));
  const proxima = ordenadas.find((c) => orden(c) > hoyIdx + 99) ?? ordenadas[0];

  return (
    <section
      aria-label="Clase de hoy"
      className="rounded-3xl bg-taupe-dark p-6 text-cream"
    >
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-sage">Hoy · {etiqueta}</p>

      {deHoy.length > 0 ? (
        <div className="mt-4 space-y-5">
          {deHoy.map((c) => (
            <div key={c.hora} className="flex items-end gap-5">
              <span className="font-serif text-6xl leading-none">{c.hora}</span>
              <div className="pb-1">
                <p className="text-lg leading-tight">{getActividad(c.actividad).nombre}</p>
                <p className="mt-0.5 text-xs text-cream/65">Tu clase fija de todas las semanas</p>
              </div>
            </div>
          ))}
          <p className="flex items-start gap-2 border-t border-cream/20 pt-4 text-xs leading-relaxed text-cream/75">
            <MapPin size={14} className="mt-0.5 shrink-0" />
            {ESTUDIO.direccion.lugar} · {ESTUDIO.direccion.detalle}
          </p>
        </div>
      ) : (
        <div className="mt-4">
          <p className="font-serif text-3xl leading-tight">Hoy descansás</p>
          {proxima && (
            <p className="mt-3 text-sm leading-relaxed text-cream/75">
              Tu próxima clase es el {nombreDia(proxima.dia)} a las {proxima.hora}:{" "}
              {getActividad(proxima.actividad).nombre}.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
