"use client";

import { useState } from "react";
import { ACTIVIDADES, getActividad, type ActividadId } from "@/lib/data/actividades";
import { CAPACIDAD, ocupadas } from "@/lib/data/cupos";
import { DIAS, GRILLA, HORA_SIN_ACTIVIDAD, type Dia } from "@/lib/data/horarios";
import { Tarjeta } from "./AdminUI";

const FIJAS = ACTIVIDADES.filter((a) => !a.aConsulta);

// Fila con la pausa de las 15:00, ordenada entre 14:00 y 16:00
const FILAS = [
  ...GRILLA.filter((f) => f.hora < HORA_SIN_ACTIVIDAD).map((f) => ({ tipo: "clase" as const, ...f })),
  { tipo: "pausa" as const, hora: HORA_SIN_ACTIVIDAD },
  ...GRILLA.filter((f) => f.hora > HORA_SIN_ACTIVIDAD).map((f) => ({ tipo: "clase" as const, ...f })),
];

function estilo(anotadas: number) {
  if (anotadas >= CAPACIDAD) return "border-amber-ink/70 bg-amber-soft/70";
  if (anotadas >= 6) return "border-taupe bg-cream-alt";
  return "border-sage-deep bg-sage-soft/70";
}

function Celda({ dia, hora, actividad, filtro }: { dia: Dia; hora: string; actividad: ActividadId; filtro: ActividadId | "todas" }) {
  const anotadas = ocupadas(dia, hora);
  const apagada = filtro !== "todas" && filtro !== actividad;
  return (
    <div className={`rounded-lg border-l-[3px] px-3 py-2 transition-opacity ${estilo(anotadas)} ${apagada ? "opacity-25" : ""}`}>
      <p className="text-xs font-medium leading-tight text-ink">{getActividad(actividad).nombre}</p>
      <p className="mt-1 text-[0.7rem] tabular-nums text-ink-soft">
        {anotadas}/{CAPACIDAD} anotadas
      </p>
    </div>
  );
}

export function ClasesGrilla() {
  const [filtro, setFiltro] = useState<ActividadId | "todas">("todas");
  const [dia, setDia] = useState<Dia>("lunes");
  const indice = DIAS.findIndex((d) => d.id === dia);

  return (
    <Tarjeta titulo="Grilla semanal" subtitulo="Cuántas alumnas están anotadas en cada clase">
      <div className="no-scrollbar flex gap-2 overflow-x-auto" role="group" aria-label="Filtrar por actividad">
        {[{ id: "todas" as const, nombre: "Todas" }, ...FIJAS].map((a) => (
          <button
            key={a.id}
            aria-pressed={filtro === a.id}
            onClick={() => setFiltro(a.id)}
            className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs tracking-wide transition-colors ${
              filtro === a.id ? "bg-sage-deep text-white" : "bg-cream-alt text-ink-soft hover:text-taupe-dark"
            }`}
          >
            {a.nombre}
          </button>
        ))}
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-soft">
        <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm border-l-[3px] border-sage-deep bg-sage-soft/70" />Con lugar</li>
        <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm border-l-[3px] border-taupe bg-cream-alt" />Casi llena</li>
        <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm border-l-[3px] border-amber-ink/70 bg-amber-soft/70" />Completa (lista de espera)</li>
      </ul>

      {/* Pantallas anchas: grilla completa (necesita el ancho de 6 columnas) */}
      <div className="mt-5 hidden overflow-hidden rounded-2xl border border-line xl:block">
        <table className="w-full table-fixed border-collapse text-sm">
          <thead>
            <tr className="border-b border-line bg-cream/60">
              <th className="w-20 p-3 text-left eyebrow">Hora</th>
              {DIAS.map((d) => (
                <th key={d.id} className="p-3 text-left font-serif text-lg font-normal text-taupe-dark">
                  {d.nombre}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FILAS.map((f) =>
              f.tipo === "pausa" ? (
                <tr key={f.hora} className="border-b border-line/70">
                  <td className="p-3 font-serif text-lg text-taupe">{f.hora}</td>
                  <td colSpan={5} className="p-2 text-center text-xs italic text-ink-soft">
                    Sin actividad
                  </td>
                </tr>
              ) : (
                <tr key={f.hora} className="border-b border-line/70 last:border-0">
                  <td className="p-3 font-serif text-lg text-taupe">{f.hora}</td>
                  {f.dias.map((id, i) => (
                    <td key={i} className="p-1.5 align-top">
                      {id ? (
                        <Celda dia={DIAS[i].id} hora={f.hora} actividad={id} filtro={filtro} />
                      ) : (
                        <p className="px-3 py-2 text-ink-soft/50">—</p>
                      )}
                    </td>
                  ))}
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>

      {/* Celular, tablet y escritorio chico: un día a la vez */}
      <div className="mt-5 xl:hidden">
        <div role="tablist" className="no-scrollbar flex gap-2 overflow-x-auto">
          {DIAS.map((d) => (
            <button
              key={d.id}
              role="tab"
              aria-selected={d.id === dia}
              onClick={() => setDia(d.id)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm transition-colors ${
                d.id === dia ? "border-taupe-dark bg-taupe-dark text-cream" : "border-line bg-paper text-ink-soft"
              }`}
            >
              {d.nombre}
            </button>
          ))}
        </div>
        <ul className="mt-4 divide-y divide-line/70 overflow-hidden rounded-2xl border border-line">
          {FILAS.map((f) => {
            if (f.tipo === "pausa") {
              return (
                <li key={f.hora} className="flex items-center gap-4 px-4 py-3">
                  <span className="w-14 font-serif text-xl text-taupe">{f.hora}</span>
                  <span className="text-sm italic text-ink-soft">Sin actividad</span>
                </li>
              );
            }
            const id = f.dias[indice];
            return (
              <li key={f.hora} className="flex items-start gap-4 px-4 py-3">
                <span className="w-14 shrink-0 pt-1 font-serif text-xl text-taupe">{f.hora}</span>
                <div className="min-w-0 flex-1">
                  {id ? (
                    <Celda dia={dia} hora={f.hora} actividad={id} filtro={filtro} />
                  ) : (
                    <p className="pt-1 text-sm text-ink-soft/60">—</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </Tarjeta>
  );
}
