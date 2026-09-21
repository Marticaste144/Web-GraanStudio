"use client";

import { useState } from "react";
import { getActividad, type Familia } from "@/lib/data/actividades";
import { DIAS, GRILLA, HORA_SIN_ACTIVIDAD, type Dia } from "@/lib/data/horarios";
import { SectionTitle } from "./SectionTitle";

const TINTE: Record<Familia, string> = {
  pilates: "bg-taupe/10 border-taupe",
  yoga: "bg-sage-soft border-sage-dark",
  esfera: "bg-amber-soft/60 border-amber-ink/60",
};

const LEYENDA: { familia: Familia; texto: string }[] = [
  { familia: "pilates", texto: "Pilates, Barre y Full Body" },
  { familia: "yoga", texto: "Yoga y Stretching" },
  { familia: "esfera", texto: "Esferodinamia" },
];

// Fila con la pausa de las 15:00, ordenada entre 14:00 y 16:00
const FILAS = [
  ...GRILLA.filter((f) => f.hora < HORA_SIN_ACTIVIDAD).map((f) => ({ tipo: "clase" as const, ...f })),
  { tipo: "pausa" as const, hora: HORA_SIN_ACTIVIDAD },
  ...GRILLA.filter((f) => f.hora > HORA_SIN_ACTIVIDAD).map((f) => ({ tipo: "clase" as const, ...f })),
];

export function Horarios() {
  const [dia, setDia] = useState<Dia>("lunes");
  const indice = DIAS.findIndex((d) => d.id === dia);

  return (
    <section id="horarios" className="mx-auto max-w-7xl px-5 py-24 md:px-8">
      <SectionTitle
        eyebrow="Horarios"
        titulo={
          <>
            Tu semana en <span className="italic text-sage-dark">Graan</span>
          </>
        }
        descripcion="Lunes a viernes, de 08:00 a 19:00. Elegís tus horarios del mes y venís siempre a la misma clase."
      />

      {/* Desktop: grilla completa */}
      <div className="mt-12 hidden overflow-hidden rounded-2xl border border-line bg-paper md:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line">
              <th className="w-24 p-4 text-left eyebrow">Hora</th>
              {DIAS.map((d) => (
                <th key={d.id} className="p-4 text-left font-serif text-xl font-medium text-taupe-dark">
                  {d.nombre}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FILAS.map((f) =>
              f.tipo === "pausa" ? (
                <tr key={f.hora} className="border-b border-line/70 last:border-0">
                  <td className="p-3 pl-4 font-serif text-lg text-taupe">{f.hora}</td>
                  <td colSpan={5} className="p-3 text-center text-xs italic tracking-wide text-ink-soft">
                    Sin actividad
                  </td>
                </tr>
              ) : (
                <tr key={f.hora} className="border-b border-line/70 last:border-0">
                  <td className="p-3 pl-4 font-serif text-lg text-taupe">{f.hora}</td>
                  {f.dias.map((id, i) => (
                    <td key={i} className="p-1.5">
                      {id ? (
                        <div
                          className={`rounded-md border-l-2 px-3 py-2 leading-tight ${TINTE[getActividad(id).familia]}`}
                        >
                          {getActividad(id).nombre}
                        </div>
                      ) : (
                        <div className="px-3 py-2 text-ink-soft/60">—</div>
                      )}
                    </td>
                  ))}
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile: un día a la vez */}
      <div className="mt-10 md:hidden">
        <div role="tablist" className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
          {DIAS.map((d) => (
            <button
              key={d.id}
              role="tab"
              aria-selected={d.id === dia}
              onClick={() => setDia(d.id)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm transition-colors ${
                d.id === dia
                  ? "border-taupe-dark bg-taupe-dark text-cream"
                  : "border-line bg-paper text-ink-soft"
              }`}
            >
              {d.nombre}
            </button>
          ))}
        </div>
        <ul className="mt-5 overflow-hidden rounded-2xl border border-line bg-paper">
          {FILAS.map((f) => {
            if (f.tipo === "pausa") {
              return (
                <li key={f.hora} className="flex items-center gap-4 border-b border-line/70 px-4 py-3">
                  <span className="w-14 font-serif text-xl text-taupe">{f.hora}</span>
                  <span className="text-sm italic text-ink-soft">Sin actividad</span>
                </li>
              );
            }
            const id = f.dias[indice];
            return (
              <li key={f.hora} className="flex items-center gap-4 border-b border-line/70 px-4 py-3 last:border-0">
                <span className="w-14 font-serif text-xl text-taupe">{f.hora}</span>
                {id ? (
                  <span className={`flex-1 rounded-md border-l-2 px-3 py-2 text-sm ${TINTE[getActividad(id).familia]}`}>
                    {getActividad(id).nombre}
                  </span>
                ) : (
                  <span className="text-sm text-ink-soft/60">—</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-6 flex flex-col gap-4 text-sm text-ink-soft md:flex-row md:items-center md:justify-between">
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {LEYENDA.map((l) => (
            <li key={l.familia} className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-sm border-l-2 ${TINTE[l.familia]}`} />
              {l.texto}
            </li>
          ))}
        </ul>
        <p>
          <strong className="font-medium text-taupe-dark">Yoga Mamá</strong> y{" "}
          <strong className="font-medium text-taupe-dark">Esfero Mamá</strong> (para embarazadas):
          se coordinan a consulta.
        </p>
      </div>
    </section>
  );
}
