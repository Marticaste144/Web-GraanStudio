"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DIAS, nombreDia, type Dia } from "@/lib/data/horarios";
import { AdminHeader, Tarjeta } from "./AdminUI";

export interface DisponibilidadVista {
  cupoMaximo: number;
  habituales: number;
  ausentesConfirmadas: number;
  recuperacionesAsignadas: number;
  lugaresNormales: number;
  lugaresLiberados: number;
  ocupacionEfectiva: number;
  disponibilidadTotal: number;
}

export interface OcurrenciaResumenVista {
  id: string;
  fecha: string;
  dia: string;
  hora: string;
  disciplinaNombre: string;
  profesoraProgramadaNombre: string;
  profesoraRealNombre: string | null;
  estado: string;
  disponibilidad: DisponibilidadVista;
}

const formatoFechaCorta = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", timeZone: "UTC" });
};

function ChipOcupacion({ d, estado }: { d: DisponibilidadVista; estado: string }) {
  if (estado === "CANCELADA") {
    return <span className="inline-block rounded-full bg-cream-alt px-2.5 py-0.5 text-[0.7rem] font-medium text-ink-soft">Cancelada</span>;
  }
  const texto = `${d.ocupacionEfectiva}/${d.cupoMaximo}`;
  if (d.disponibilidadTotal === 0) {
    return <span className="inline-block rounded-full bg-amber-soft px-2.5 py-0.5 text-[0.7rem] font-medium text-amber-ink">{texto} · Completa</span>;
  }
  if (d.lugaresLiberados > 0) {
    return (
      <span className="inline-block rounded-full bg-sage-mist px-2.5 py-0.5 text-[0.7rem] font-medium text-sage-deep">
        {texto} · {d.lugaresLiberados} liberado{d.lugaresLiberados > 1 ? "s" : ""}
      </span>
    );
  }
  return <span className="inline-block rounded-full bg-sage-soft px-2.5 py-0.5 text-[0.7rem] font-medium text-sage-deep">{texto}</span>;
}

function CeldaClase({ o }: { o: OcurrenciaResumenVista }) {
  return (
    <Link
      href={`/admin/grillas/${o.id}`}
      className={`block w-full rounded-lg border-l-[3px] px-3 py-2 text-left transition hover:shadow-sm hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-deep ${
        o.estado === "CANCELADA" ? "border-ink-soft/40 bg-cream-alt/70 opacity-60" : "border-sage-deep bg-sage-soft/70"
      }`}
    >
      <span className="block text-xs font-medium leading-tight text-ink">{o.disciplinaNombre}</span>
      <span className="mt-0.5 block text-[0.7rem] text-ink-soft">
        {o.profesoraRealNombre && o.profesoraRealNombre !== o.profesoraProgramadaNombre
          ? `${o.profesoraRealNombre} (reemplazo)`
          : o.profesoraProgramadaNombre}
      </span>
      <div className="mt-1.5">
        <ChipOcupacion d={o.disponibilidad} estado={o.estado} />
      </div>
    </Link>
  );
}

export function GrillaSemanal({
  lunesISO,
  dias,
  hrefAnterior,
  hrefSiguiente,
  hrefHoy,
  esSemanaActual,
  error,
  semanaVacia,
}: {
  lunesISO: string;
  dias: Record<string, OcurrenciaResumenVista[]> | null;
  hrefAnterior: string;
  hrefSiguiente: string;
  hrefHoy: string;
  esSemanaActual: boolean;
  /** Falló la generación/carga de esta semana: nunca se muestra como si simplemente no hubiera clases. */
  error?: string;
  /** No hay NINGUNA ClaseRecurrente activa en todo el estudio: esto sí es un vacío real, no un error. */
  semanaVacia?: boolean;
}) {
  const [diaMovil, setDiaMovil] = useState<Dia>("lunes");

  const lunes = new Date(lunesISO);
  const fechaDeDia = (indice: number) => new Date(lunes.getTime() + indice * 86400000);
  const horas = dias ? [...new Set(DIAS.flatMap((d) => dias[d.id].map((o) => o.hora)))].sort() : [];
  const enGrilla = (dia: Dia, hora: string) => (dias ? dias[dia].filter((o) => o.hora === hora) : []);

  const navegacion = (
    <div className="flex items-center gap-2">
      <Link href={hrefAnterior} className="btn btn-outline btn-sm" aria-label="Semana anterior">
        <ChevronLeft size={16} />
      </Link>
      <Link href={hrefHoy} className={`btn btn-sm ${esSemanaActual ? "btn-outline pointer-events-none opacity-50" : "btn-primary"}`}>
        Semana actual
      </Link>
      <Link href={hrefSiguiente} className="btn btn-outline btn-sm" aria-label="Semana siguiente">
        <ChevronRight size={16} />
      </Link>
    </div>
  );

  return (
    <main className="mx-auto max-w-[90rem] px-4 pb-16 pt-8 sm:px-8 lg:px-10 lg:pt-12">
      <AdminHeader
        titulo="Grillas"
        subtitulo="Semana operativa: quién tiene lugar en cada clase, ocupación real y lugares liberados por ausencias."
        accion={navegacion}
      />

      <p className="mt-3 text-sm text-ink-soft">
        {formatoFechaCorta(fechaDeDia(0).toISOString())} — {formatoFechaCorta(fechaDeDia(4).toISOString())}
      </p>

      {error ? (
        <div className="mt-6 lg:mt-8">
          <p role="alert" className="rounded-2xl bg-amber-soft px-5 py-4 text-sm leading-relaxed text-amber-ink">{error}</p>
        </div>
      ) : semanaVacia ? (
        <div className="mt-6 lg:mt-8">
          <Tarjeta titulo="Semana">
            <p className="py-6 text-center text-sm text-ink-soft">No hay clases programadas para esta semana.</p>
          </Tarjeta>
        </div>
      ) : dias ? (
      <div className="mt-6 lg:mt-8">
        <Tarjeta titulo="Semana" subtitulo="Tocá una clase para ver quién está anotado y tomar asistencia">
          {/* Escritorio ancho: grilla completa */}
          <div className="mt-2 hidden overflow-hidden rounded-2xl border border-line xl:block">
            <table className="w-full table-fixed border-collapse text-sm">
              <thead>
                <tr className="border-b border-line bg-cream/60">
                  <th className="w-20 p-3 text-left eyebrow">Hora</th>
                  {DIAS.map((d, i) => (
                    <th key={d.id} className="p-3 text-left font-serif text-lg font-normal text-taupe-dark">
                      {d.nombre} <span className="text-sm font-sans text-ink-soft">{formatoFechaCorta(fechaDeDia(i).toISOString())}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {horas.map((h) => (
                  <tr key={h} className="border-b border-line/70 last:border-0">
                    <td className="p-3 font-serif text-lg text-taupe">{h}</td>
                    {DIAS.map((d) => {
                      const ocs = enGrilla(d.id, h);
                      return (
                        <td key={d.id} className="space-y-1.5 p-1.5 align-top">
                          {ocs.length === 0 ? <p className="px-3 py-2 text-ink-soft/50">—</p> : ocs.map((o) => <CeldaClase key={o.id} o={o} />)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Celular, tablet y escritorio chico: un día a la vez */}
          <div className="mt-5 xl:hidden">
            <div role="tablist" className="no-scrollbar flex gap-2 overflow-x-auto">
              {DIAS.map((d, i) => (
                <button
                  key={d.id}
                  role="tab"
                  aria-selected={d.id === diaMovil}
                  onClick={() => setDiaMovil(d.id)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm transition-colors ${
                    d.id === diaMovil ? "border-taupe-dark bg-taupe-dark text-cream" : "border-line bg-paper text-ink-soft"
                  }`}
                >
                  {d.corto} {formatoFechaCorta(fechaDeDia(i).toISOString())}
                </button>
              ))}
            </div>
            {dias[diaMovil].length === 0 ? (
              <p className="mt-4 rounded-2xl border border-line px-4 py-6 text-center text-sm italic text-ink-soft">Sin clases este día.</p>
            ) : (
              <ul className="mt-4 divide-y divide-line/70 overflow-hidden rounded-2xl border border-line">
                {dias[diaMovil].map((o) => (
                  <li key={o.id} className="flex items-start gap-4 px-4 py-3">
                    <span className="w-14 shrink-0 pt-1 font-serif text-xl text-taupe">{o.hora}</span>
                    <div className="min-w-0 flex-1">
                      <CeldaClase o={o} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Tarjeta>
      </div>
      ) : null}
    </main>
  );
}
