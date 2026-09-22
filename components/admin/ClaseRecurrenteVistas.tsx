"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Campo, Selector } from "@/components/auth/Campo";
import { DIAS, nombreDia, type Dia } from "@/lib/data/horarios";
import type { DatosClaseRecurrente } from "@/lib/clases/actions";
import type { ClaseRecurrenteVista, Disciplina, Profesora } from "./ClasesRecurrentesAdmin";

export const HORAS_DISPONIBLES = Array.from({ length: 12 }, (_, i) => `${String(8 + i).padStart(2, "0")}:00`);

const resumen = (c: Pick<ClaseRecurrenteVista, "disciplinaNombre" | "dia" | "hora">) =>
  `${c.disciplinaNombre} · ${nombreDia(c.dia as Dia)} · ${c.hora}`;

type Resultado = { ok: true } | { ok: false; error: string };

// ---------------------------------------------------------------------------------------------
// Detalle: los datos de la clase. Todavía sin alumnas anotadas (eso llega con la importación).
// ---------------------------------------------------------------------------------------------
export function ClaseRecurrenteDetalle({
  clase,
  onEditar,
  onEliminar,
}: {
  clase: ClaseRecurrenteVista;
  onEditar: () => void;
  onEliminar: () => void;
}) {
  return (
    <div>
      <p className="eyebrow">Detalle de la clase</p>
      <h2 className="mt-2 pr-10 text-[1.9rem] leading-tight text-taupe-dark sm:text-3xl">{clase.disciplinaNombre}</h2>
      <p className="mt-1 text-sm text-ink-soft">
        {nombreDia(clase.dia as Dia)} · {clase.hora}
      </p>

      <dl className="mt-5 divide-y divide-line border-y border-line">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3.5">
          <dt className="shrink-0 text-[0.7rem] uppercase tracking-[0.15em] text-ink-soft">Profesor/a</dt>
          <dd className="min-w-0 break-words text-sm text-ink">{clase.profesoraNombre}</dd>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3.5">
          <dt className="shrink-0 text-[0.7rem] uppercase tracking-[0.15em] text-ink-soft">Cupo máximo</dt>
          <dd className="min-w-0 break-words text-sm text-ink">{clase.cupo} alumnas</dd>
        </div>
      </dl>

      <p className="mt-4 text-sm text-ink-soft">
        Todavía no hay alumnas cargadas en el sistema real: la asignación a esta clase se conecta en el próximo bloque.
      </p>

      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <button type="button" className="btn btn-primary btn-sm" onClick={onEditar}>
          <Pencil size={14} />
          Editar clase
        </button>
        <button type="button" className="btn btn-outline btn-sm sm:ml-auto" onClick={onEliminar}>
          <Trash2 size={14} />
          Eliminar clase
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Formulario para crear o editar: disciplina, día, hora, profesora y cupo máximo.
// ---------------------------------------------------------------------------------------------
export function ClaseRecurrenteFormulario({
  inicial,
  disciplinas,
  profesoras,
  onGuardar,
  onCancelar,
}: {
  inicial?: ClaseRecurrenteVista;
  disciplinas: Disciplina[];
  profesoras: Profesora[];
  onGuardar: (datos: DatosClaseRecurrente) => Promise<Resultado>;
  onCancelar: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const editando = Boolean(inicial);
  // Disciplinas "a consultar" (embarazadas) todavía no tienen horario fijo: no se ofrecen acá.
  const disciplinasConHorario = disciplinas.filter((d) => !d.aConsulta);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setEnviando(true);
        const resultado = await onGuardar({
          disciplinaId: String(f.get("disciplinaId") ?? ""),
          profesoraId: String(f.get("profesoraId") ?? ""),
          dia: String(f.get("dia") ?? ""),
          hora: String(f.get("hora") ?? ""),
          cupo: Number(f.get("cupo")),
        });
        setEnviando(false);
        if (!resultado.ok) setError(resultado.error);
      }}
    >
      <p className="eyebrow">{editando ? "Editar clase" : "Nueva clase"}</p>
      <h2 className="mt-2 pr-10 text-[1.9rem] leading-tight text-taupe-dark sm:text-3xl">
        {editando ? resumen(inicial!) : "Cargá los datos de la clase"}
      </h2>

      <div className="mt-6 space-y-4">
        <Selector
          label="Disciplina"
          name="disciplinaId"
          required
          defaultValue={inicial?.disciplinaId ?? ""}
          onChange={() => setError(null)}
        >
          <option value="" disabled>
            Elegí una disciplina
          </option>
          {disciplinasConHorario.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nombre}
            </option>
          ))}
        </Selector>

        <div className="grid gap-4 sm:grid-cols-2">
          <Selector label="Día" name="dia" required defaultValue={inicial?.dia ?? ""} onChange={() => setError(null)}>
            <option value="" disabled>
              Elegí un día
            </option>
            {DIAS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre}
              </option>
            ))}
          </Selector>
          <Selector label="Hora" name="hora" required defaultValue={inicial?.hora ?? ""} onChange={() => setError(null)}>
            <option value="" disabled>
              Elegí una hora
            </option>
            {HORAS_DISPONIBLES.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </Selector>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Selector
            label="Profesor/a"
            name="profesoraId"
            required
            defaultValue={inicial?.profesoraId ?? ""}
            onChange={() => setError(null)}
          >
            <option value="" disabled>
              Elegí una profesora
            </option>
            {profesoras.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </Selector>
          <Campo
            label="Cupo máximo"
            name="cupo"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            required
            defaultValue={inicial?.cupo ?? 6}
            onChange={() => setError(null)}
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-5 rounded-2xl bg-amber-soft px-4 py-3 text-sm leading-snug text-amber-ink">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
        <button type="submit" disabled={enviando} className="btn btn-sage btn-sm disabled:opacity-60">
          {enviando ? "Guardando…" : editando ? "Guardar cambios" : "Crear clase"}
        </button>
        <button type="button" className="btn btn-outline btn-sm" onClick={onCancelar} disabled={enviando}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------------------------
// Confirmación: nunca se elimina al primer toque.
// ---------------------------------------------------------------------------------------------
export function ClaseRecurrenteEliminar({
  clase,
  onConfirmar,
  onCancelar,
}: {
  clase: ClaseRecurrenteVista;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  return (
    <div role="alertdialog" aria-labelledby="eliminar-titulo">
      <p className="eyebrow">Eliminar clase</p>
      <h2 id="eliminar-titulo" className="mt-2 pr-10 text-[1.9rem] leading-tight text-taupe-dark sm:text-3xl">
        ¿Seguro que querés eliminar esta clase?
      </h2>

      <div className="mt-5 rounded-2xl border border-line bg-cream px-4 py-4">
        <p className="font-serif text-xl leading-snug text-taupe-dark">{clase.disciplinaNombre}</p>
        <p className="mt-1 text-sm text-ink-soft">
          {nombreDia(clase.dia as Dia)} · {clase.hora} · {clase.profesoraNombre}
        </p>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-ink-soft">
        La clase deja de aparecer en la grilla. Se puede volver a crear en el mismo horario más adelante.
      </p>

      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
        <button type="button" className="btn btn-sm bg-amber-ink text-white hover:bg-taupe-dark" onClick={onConfirmar}>
          <Trash2 size={14} />
          Sí, eliminar
        </button>
        <button type="button" className="btn btn-outline btn-sm" onClick={onCancelar}>
          No, volver
        </button>
      </div>
    </div>
  );
}
