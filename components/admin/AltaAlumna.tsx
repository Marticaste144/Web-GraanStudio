"use client";

import { useState } from "react";
import { Campo, Selector } from "@/components/auth/Campo";
import { PLANES, formatoPeso } from "@/lib/data/alumna";
import type { ClasesPorSemana } from "@/lib/data/admin";
import { useClasesAdmin } from "./ClasesProvider";
import type { DatosAlta } from "./AdminAlumnasProvider";
import { SelectorClases } from "./SelectorClases";

interface Props {
  onGuardar: (datos: DatosAlta, claseIds: string[]) => void;
  onCancelar: () => void;
}

/**
 * Alta manual de una alumna: nombre, apellido, teléfono, email y plan, más las clases (opcional).
 * No hay campo "Estado": toda alumna nueva queda activa, y se cambia después desde su ficha.
 */
export function AltaAlumna({ onGuardar, onCancelar }: Props) {
  const { clases } = useClasesAdmin();
  const [plan, setPlan] = useState<"" | "1" | "2" | "3">("");
  const [seleccion, setSeleccion] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const max = plan ? Number(plan) : 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const v = (k: string) => String(f.get(k) ?? "").trim();
        if (seleccion.length > max) {
          setError(`Elegiste ${seleccion.length} clases y el plan incluye ${max}. Sacá alguna o elegí un plan con más clases.`);
          return;
        }
        onGuardar(
          {
            nombre: v("nombre"),
            apellido: v("apellido"),
            telefono: v("telefono"),
            email: v("email"),
            clasesPorSemana: Number(plan) as ClasesPorSemana,
          },
          seleccion,
        );
      }}
    >
      <p className="eyebrow">Nueva alumna</p>
      <h2 className="mt-2 pr-10 text-[1.9rem] leading-tight text-taupe-dark sm:text-3xl">Alta de alumna</h2>

      <div className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Nombre" name="nombre" autoComplete="off" required placeholder="Nombre" onChange={() => setError(null)} />
          <Campo label="Apellido" name="apellido" autoComplete="off" required placeholder="Apellido" onChange={() => setError(null)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Teléfono" name="telefono" type="tel" autoComplete="off" placeholder="+54 9 11 …" />
          <Campo label="Email" name="email" type="email" autoComplete="off" required placeholder="nombre@email.com" onChange={() => setError(null)} />
        </div>

        <Selector
          label="Plan"
          name="plan"
          required
          value={plan}
          onChange={(e) => {
            setPlan(e.target.value as "" | "1" | "2" | "3");
            setError(null);
          }}
        >
          <option value="" disabled>
            Elegí un plan
          </option>
          {([1, 2, 3] as const).map((n) => (
            <option key={n} value={n}>
              {PLANES[n].nombre} · {formatoPeso(PLANES[n].monto)}
            </option>
          ))}
        </Selector>

        {plan ? (
          <SelectorClases
            clases={clases}
            seleccion={seleccion}
            onCambiar={(ids) => {
              setSeleccion(ids);
              setError(null);
            }}
            max={max}
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-taupe/40 px-4 py-5 text-center text-sm text-ink-soft">
            Elegí el plan para poder asignarle sus clases. También podés hacerlo después, desde su ficha.
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-5 rounded-2xl bg-amber-soft px-4 py-3 text-sm leading-snug text-amber-ink">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
        <button type="submit" className="btn btn-sage btn-sm">
          Guardar alumna
        </button>
        <button type="button" className="btn btn-outline btn-sm" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
