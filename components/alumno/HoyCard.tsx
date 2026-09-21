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
 * Tarjeta compacta de Inicio. Cada clase se muestra UNA sola vez:
 * - Panel oscuro: la próxima clase.
 * - Panel claro: las OTRAS clases que tiene hoy (nunca repite la próxima).
 * Solo informativa.
 */
export function HoyCard({ dia, etiqueta, hora }: { dia: Dia; etiqueta: string; hora: number }) {
  const { misClases } = useAlumno();
  const ordenadas = [...misClases].sort((a, b) => orden(a) - orden(b));

  // Próxima clase: la primera desde ahora; si ya no quedan en la semana, la primera de la semana siguiente.
  const ahora = indiceDia(dia) * 100 + hora;
  const proxima = ordenadas.find((c) => orden(c) >= ahora) ?? ordenadas[0];

  const esLaProxima = (c: Clase) => Boolean(proxima) && c.dia === proxima.dia && c.hora === proxima.hora;
  const proximaEsHoy = Boolean(proxima) && proxima.dia === dia;
  const otrasHoy = ordenadas.filter((c) => c.dia === dia && !esLaProxima(c));

  let cuando = "";
  if (proxima) {
    const dif = (indiceDia(proxima.dia) - indiceDia(dia) + 5) % 5;
    cuando = proximaEsHoy ? "Hoy" : dif === 1 ? "Mañana" : nombreDia(proxima.dia);
  }

  const vacio = !proxima
    ? "Cuando te anotes, tus clases del día aparecen acá."
    : proximaEsHoy
      ? "No tenés otras clases hoy."
      : "Hoy no tenés clases. ¡Disfrutá el día!";

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

      {/* Otras clases de hoy */}
      <div className="p-5 sm:p-6">
        <p className="eyebrow">
          {proximaEsHoy ? "Otras clases de hoy" : "Clases de hoy"} · {etiqueta}
        </p>
        {otrasHoy.length > 0 ? (
          <ul className="mt-3 divide-y divide-line">
            {otrasHoy.map((c) => (
              <li key={c.hora} className="flex items-center gap-4 py-2.5 first:pt-0 last:pb-0">
                <span className="w-14 shrink-0 font-serif text-2xl leading-none text-taupe-dark">{c.hora}</span>
                <span className="min-w-0 flex-1 text-sm">{getActividad(c.actividad).nombre}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">{vacio}</p>
        )}
      </div>
    </section>
  );
}
