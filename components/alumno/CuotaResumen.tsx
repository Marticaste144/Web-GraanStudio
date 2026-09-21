"use client";

import Link from "next/link";
import { ArrowRight, CalendarClock } from "lucide-react";
import { formatoPeso } from "@/lib/data/alumna";
import { useAlumno } from "./AlumnoProvider";

export function EstadoCuota({ enRevision }: { enRevision: boolean }) {
  return enRevision ? (
    <span className="pop shrink-0 whitespace-nowrap rounded-full bg-sage-deep px-3 py-1.5 text-xs font-medium text-white">
      En revisión
    </span>
  ) : (
    <span className="shrink-0 whitespace-nowrap rounded-full bg-amber-soft px-3 py-1.5 text-xs font-medium text-amber-ink">
      Pendiente
    </span>
  );
}

/** Resumen compacto de la cuota del mes (Inicio). */
export function CuotaResumen({ mes, vence }: { mes: string; vence: string }) {
  const { plan, comprobante } = useAlumno();

  return (
    <section
      aria-label="Mi cuota"
      className="flex h-full flex-col justify-between gap-4 rounded-3xl border border-sage/40 bg-sage-soft p-5 sm:p-6"
    >
      <div>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <p className="eyebrow">Cuota de {mes}</p>
          {plan && <EstadoCuota enRevision={Boolean(comprobante)} />}
        </div>
        {plan ? (
          <p className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
            <span className="font-serif text-[2.2rem] leading-none text-taupe-dark">{formatoPeso(plan.monto)}</span>
            <span className="text-xs text-ink-soft">{plan.nombre}</span>
          </p>
        ) : (
          <p className="mt-3 font-serif text-2xl leading-tight text-taupe-dark">Todavía sin cuota</p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-sage/40 pt-3">
        {plan && (
          <p className="flex items-center gap-2 text-xs text-ink-soft">
            <CalendarClock size={14} className="shrink-0 text-sage-deep" />
            {comprobante ? "Comprobante recibido" : `Vence el ${vence}`}
          </p>
        )}
        <Link
          href={plan ? "/alumno/cuota" : "/alumno/ver-clases"}
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-sage-deep hover:text-taupe-dark"
        >
          {plan ? "Ver cuota" : "Elegir clases"}
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}
