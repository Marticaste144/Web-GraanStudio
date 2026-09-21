"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { getActividad } from "@/lib/data/actividades";
import { ESTUDIO } from "@/lib/data/estudio";
import { DIAS, nombreDia, type Clase, type Dia } from "@/lib/data/horarios";
import { useAlumno } from "./AlumnoProvider";

const indiceDia = (d: Dia) => DIAS.findIndex((x) => x.id === d);
const orden = (c: Clase) => indiceDia(c.dia) * 100 + parseInt(c.hora);

/**
 * Tarjeta compacta de Inicio: la próxima clase (panel oscuro) y las clases de hoy (panel claro).
 * Solo informativa.
 */
export function HoyCard({ dia, etiqueta, hora }: { dia: Dia; etiqueta: string; hora: number }) {
  const { misClases } = useAlumno();
  const ordenadas = [...misClases].sort((a, b) => orden(a) - orden(b));
  const deHoy = ordenadas.filter((c) => c.dia === dia);

  // Próxima clase: la primera desde ahora; si ya no quedan en la semana, la primera de la semana siguiente.
  const ahora = indiceDia(dia) * 100 + hora;
  const proxima = ordenadas.find((c) => orden(c) >= ahora) ?? ordenadas[0];

  let cuando = "";
  if (proxima) {
    const dif = (indiceDia(proxima.dia) - indiceDia(dia) + 5) % 5;
    cuando = proxima.dia === dia && orden(proxima) >= ahora ? "Hoy" : dif === 1 ? "Mañana" : nombreDia(proxima.dia);
  }

  return (
    <section aria-label="Próxima clase y clases de hoy" className="grid overflow-hidden rounded-3xl border border-line bg-paper md:grid-cols-[1.15fr_1fr]">
      {/* Próxima clase */}
      <div className="bg-taupe-dark p-5 text-cream sm:p-6">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-sage">Próxima clase</p>
        {proxima ? (
          <>
            <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="font-serif text-[2.6rem] leading-none sm:text-5xl">{proxima.hora}</span>
              <span className="text-sm text-cream/80">{cuando}</span>
            </div>
            <p className="mt-1.5 font-serif text-xl italic leading-tight">{getActividad(proxima.actividad).nombre}</p>
            <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-cream/75">
              <MapPin size={13} className="mt-0.5 shrink-0" />
              {ESTUDIO.direccion.lugar} · {ESTUDIO.direccion.detalle}
            </p>
          </>
        ) : (
          <p className="mt-3 text-sm leading-relaxed text-cream/80">
            Todavía no tenés clases.{" "}
            <Link href="/alumno/ver-clases" className="font-medium underline underline-offset-4">
              Elegí tus horarios
            </Link>
          </p>
        )}
      </div>

      {/* Clases de hoy */}
      <div className="p-5 sm:p-6">
        <p className="eyebrow">Hoy · {etiqueta}</p>
        {deHoy.length > 0 ? (
          <ul className="mt-3 divide-y divide-line">
            {deHoy.map((c) => {
              const esProxima = proxima && c.dia === proxima.dia && c.hora === proxima.hora;
              return (
                <li key={c.hora} className="flex items-center gap-4 py-2.5 first:pt-0 last:pb-0">
                  <span className="w-14 shrink-0 font-serif text-2xl leading-none text-taupe-dark">{c.hora}</span>
                  <span className="min-w-0 flex-1 text-sm">{getActividad(c.actividad).nombre}</span>
                  {esProxima && (
                    <span className="shrink-0 rounded-full bg-sage-soft px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-wider text-sage-deep">
                      Próxima
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            {misClases.length === 0 ? "Cuando te anotes, tus clases del día aparecen acá." : "Hoy no tenés clases. ¡Disfrutá el día!"}
          </p>
        )}
      </div>
    </section>
  );
}
