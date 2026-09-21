"use client";

import Link from "next/link";
import { ArrowRight, CalendarClock } from "lucide-react";
import { formatoPeso } from "@/lib/data/alumna";
import { useAlumno } from "./AlumnoProvider";

export function EstadoCuota({ enRevision }: { enRevision: boolean }) {
  return enRevision ? (
    <span className="pop shrink-0 rounded-full bg-sage-soft px-3 py-1.5 text-xs font-medium text-sage-dark">
      En revisión
    </span>
  ) : (
    <span className="shrink-0 rounded-full bg-amber-soft px-3 py-1.5 text-xs font-medium text-amber-ink">
      Pendiente
    </span>
  );
}

/** Tarjeta resumen de la cuota del mes (Inicio). */
export function CuotaResumen({ mes, vence }: { mes: string; vence: string }) {
  const { plan, comprobante } = useAlumno();

  return (
    <section
      aria-label="Mi cuota"
      className="flex h-full flex-col justify-between rounded-3xl border border-line bg-paper p-6 sm:p-8"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <p className="eyebrow">Cuota de {mes}</p>
          {plan && <EstadoCuota enRevision={Boolean(comprobante)} />}
        </div>
        {plan ? (
          <>
            <p className="mt-5 font-serif text-5xl leading-none text-taupe-dark sm:text-6xl">
              {formatoPeso(plan.monto)}
            </p>
            <p className="mt-2 text-sm text-ink-soft">{plan.nombre}</p>
          </>
        ) : (
          <p className="mt-5 font-serif text-3xl leading-tight text-taupe-dark">Todavía sin cuota</p>
        )}
      </div>

      <div className="mt-8">
        {plan && (
          <p className="flex items-center gap-2 border-t border-line pt-4 text-sm text-ink-soft">
            <CalendarClock size={16} className="shrink-0 text-taupe" />
            {comprobante ? "Comprobante recibido" : `Vence el ${vence}`}
          </p>
        )}
        <Link
          href={plan ? "/alumno/cuota" : "/alumno/ver-clases"}
          className="group mt-4 inline-flex items-center gap-2 text-sm font-medium text-taupe-dark"
        >
          {plan ? "Ver cuota y pagar" : "Elegir mis clases"}
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
