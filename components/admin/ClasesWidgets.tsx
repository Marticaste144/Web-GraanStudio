"use client";

// Bloques del Admin que dependen de las clases (se actualizan cuando la administradora
// crea, edita o elimina una clase en Admin > Clases).

import { getActividad } from "@/lib/data/actividades";
import {
  estaLlena,
  ocupacionPorActividad,
  ocupacionPorDia,
  ocupacionPorFranja,
  ocupacionPromedio,
  ordenSemanal,
} from "@/lib/data/clasesAdmin";
import type { Dia } from "@/lib/data/horarios";
import { Barra, Metrica, Tarjeta } from "./AdminUI";
import { useClasesAdmin } from "./ClasesProvider";

export function MetricaClasesHoy({ dia }: { dia: Dia }) {
  const { clases } = useClasesAdmin();
  return <Metrica etiqueta="Clases hoy" valor={String(clases.filter((c) => c.dia === dia).length)} nota="programadas para hoy" />;
}

export function MetricaOcupacion({ nota, tono }: { nota: string; tono?: "paper" | "oscura" | "sage" }) {
  const { clases } = useClasesAdmin();
  return <Metrica etiqueta="Ocupación promedio" valor={`${ocupacionPromedio(clases)}%`} nota={nota} tono={tono} />;
}

export function AgendaHoy({ dia }: { dia: Dia }) {
  const { clases } = useClasesAdmin();
  const deHoy = clases.filter((c) => c.dia === dia).sort((a, b) => ordenSemanal(a) - ordenSemanal(b));
  return (
    <Tarjeta titulo="Agenda de hoy" enlace={{ href: "/admin/clases", texto: "Ver todas las clases" }}>
      {deHoy.length === 0 ? (
        <p className="text-sm text-ink-soft">Hoy no hay clases programadas.</p>
      ) : (
        <ul className="divide-y divide-line">
          {deHoy.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3.5">
              <div className="flex min-w-0 items-center gap-4">
                <span className="w-16 shrink-0 font-serif text-2xl leading-none text-taupe-dark">{c.hora}</span>
                <span className="text-sm">{getActividad(c.actividad).nombre}</span>
              </div>
              <span
                className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium tabular-nums ${
                  estaLlena(c) ? "bg-amber-soft text-amber-ink" : "bg-cream-alt text-ink-soft"
                }`}
              >
                {c.alumnas.length}/{c.cupo} anotadas
              </span>
            </li>
          ))}
        </ul>
      )}
    </Tarjeta>
  );
}

export function OcupacionPorActividad({ conEnlace }: { conEnlace?: boolean }) {
  const { clases } = useClasesAdmin();
  return (
    <Tarjeta
      titulo="Ocupación por clase"
      subtitulo="Promedio semanal"
      tono="sage"
      enlace={conEnlace ? { href: "/admin/metricas", texto: "Ver métricas" } : undefined}
    >
      <ul className="space-y-4">
        {ocupacionPorActividad(clases).map((a) => (
          <li key={a.id}>
            <Barra etiqueta={a.nombre} valor={`${a.porcentaje}%`} porcentaje={a.porcentaje} />
          </li>
        ))}
      </ul>
    </Tarjeta>
  );
}

export function OcupacionPorDia() {
  const { clases } = useClasesAdmin();
  return (
    <Tarjeta titulo="Ocupación por día">
      <ul className="space-y-4">
        {ocupacionPorDia(clases).map((d) => (
          <li key={d.dia}>
            <Barra etiqueta={d.nombre} valor={`${d.porcentaje}%`} porcentaje={d.porcentaje} />
          </li>
        ))}
      </ul>
    </Tarjeta>
  );
}

export function OcupacionPorFranja() {
  const { clases } = useClasesAdmin();
  return (
    <Tarjeta titulo="Ocupación por franja horaria" tono="cream">
      <ul className="space-y-4">
        {ocupacionPorFranja(clases).map((f) => (
          <li key={f.nombre}>
            <Barra etiqueta={f.nombre} valor={`${f.porcentaje}%`} porcentaje={f.porcentaje} color="taupe" />
          </li>
        ))}
      </ul>
    </Tarjeta>
  );
}
