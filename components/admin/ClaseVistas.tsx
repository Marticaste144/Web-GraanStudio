"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Pencil, Trash2 } from "lucide-react";
import { Campo, Selector } from "@/components/auth/Campo";
import { ACTIVIDADES_CON_HORARIO, HORAS_DISPONIBLES, PROFESORAS_EJEMPLO, type ClaseAdmin, type DatosClase } from "@/lib/data/clasesAdmin";
import { getActividad, type ActividadId } from "@/lib/data/actividades";
import { CAPACIDAD } from "@/lib/data/cupos";
import { DIAS, nombreDia, type Dia } from "@/lib/data/horarios";
import { useAdminAlumnas } from "./AdminAlumnasProvider";
import type { Resultado } from "./ClasesProvider";

const resumen = (c: Pick<ClaseAdmin, "actividad" | "dia" | "hora">) =>
  `${getActividad(c.actividad).nombre} · ${nombreDia(c.dia)} · ${c.hora}`;

// ---------------------------------------------------------------------------------------------
// Detalle: cuántas alumnas hay, quiénes son (con acceso a su ficha) y las acciones de gestión.
// ---------------------------------------------------------------------------------------------
export function ClaseDetalle({
  clase,
  onEditar,
  onEliminar,
}: {
  clase: ClaseAdmin;
  onEditar: () => void;
  onEliminar: () => void;
}) {
  const { datos, buscar } = useAdminAlumnas();
  const anotadas = clase.alumnas
    .map((id) => buscar(id))
    .filter((a): a is NonNullable<typeof a> => Boolean(a))
    .map(datos)
    .sort((a, b) => a.apellido.localeCompare(b.apellido, "es") || a.nombre.localeCompare(b.nombre, "es"));
  const porcentaje = Math.min(100, Math.round((clase.alumnas.length / clase.cupo) * 100));

  return (
    <div>
      <p className="eyebrow">Detalle de la clase</p>
      <h2 className="mt-2 pr-10 text-[1.9rem] leading-tight text-taupe-dark sm:text-3xl">{getActividad(clase.actividad).nombre}</h2>
      <p className="mt-1 text-sm text-ink-soft">
        {nombreDia(clase.dia)} · {clase.hora}
      </p>

      <div className="mt-5 rounded-2xl border border-sage/40 bg-sage-mist p-4 sm:p-5">
        <p className="font-serif text-4xl leading-none text-taupe-dark">
          {clase.alumnas.length} / {clase.cupo}
          <span className="ml-2 font-sans text-sm text-ink-soft">alumnas</span>
        </p>
        <div
          className="mt-3 h-2.5 overflow-hidden rounded-full bg-paper"
          role="progressbar"
          aria-valuenow={porcentaje}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Cupo ocupado"
        >
          <div className="h-full rounded-full bg-sage-deep" style={{ width: `${porcentaje}%` }} />
        </div>
      </div>

      <dl className="mt-4 border-y border-line">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3.5">
          <dt className="shrink-0 text-[0.7rem] uppercase tracking-[0.15em] text-ink-soft">Profesor/a</dt>
          <dd className="min-w-0 break-words text-sm text-ink">{clase.profesora}</dd>
        </div>
      </dl>

      <h3 className="eyebrow mt-6">Alumnas anotadas</h3>
      {anotadas.length > 0 ? (
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {anotadas.map((a) => (
            <li key={a.id}>
              <Link
                href={`/admin/alumnos/${a.id}`}
                className="group flex items-center justify-between gap-3 py-3 text-sm text-ink transition-colors hover:text-taupe-dark"
              >
                <span className="min-w-0 break-words">
                  <span className="font-medium text-taupe-dark group-hover:underline group-hover:underline-offset-4">
                    {a.nombre} {a.apellido}
                  </span>
                  {!a.activa && <span className="ml-2 text-xs text-ink-soft">(inactiva)</span>}
                </span>
                <ChevronRight size={16} className="shrink-0 text-taupe transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 rounded-2xl border border-dashed border-taupe/40 px-4 py-6 text-center text-sm text-ink-soft">
          Todavía no hay alumnas anotadas en esta clase.
        </p>
      )}

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
// Formulario para crear o editar: actividad, día, hora, profesor/a y cupo máximo. Nada más.
// ---------------------------------------------------------------------------------------------
export function ClaseFormulario({
  inicial,
  onGuardar,
  onCancelar,
}: {
  inicial?: ClaseAdmin;
  onGuardar: (datos: DatosClase) => Resultado;
  onCancelar: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const editando = Boolean(inicial);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const resultado = onGuardar({
          actividad: String(f.get("actividad")) as ActividadId,
          dia: String(f.get("dia")) as Dia,
          hora: String(f.get("hora")),
          profesora: String(f.get("profesora") ?? ""),
          cupo: Number(f.get("cupo")),
        });
        if (!resultado.ok) setError(resultado.error);
      }}
    >
      <p className="eyebrow">{editando ? "Editar clase" : "Nueva clase"}</p>
      <h2 className="mt-2 pr-10 text-[1.9rem] leading-tight text-taupe-dark sm:text-3xl">
        {editando ? resumen(inicial!) : "Cargá los datos de la clase"}
      </h2>

      <div className="mt-6 space-y-4">
        <Selector label="Actividad" name="actividad" required defaultValue={inicial?.actividad ?? ""} onChange={() => setError(null)}>
          <option value="" disabled>
            Elegí una actividad
          </option>
          {ACTIVIDADES_CON_HORARIO.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nombre}
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
          <div>
            <Campo
              label="Profesor/a"
              name="profesora"
              required
              list="profesoras-ejemplo"
              autoComplete="off"
              placeholder="Nombre"
              defaultValue={inicial?.profesora ?? ""}
              onChange={() => setError(null)}
            />
            <datalist id="profesoras-ejemplo">
              {PROFESORAS_EJEMPLO.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </div>
          <Campo
            label="Cupo máximo"
            name="cupo"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            required
            defaultValue={inicial?.cupo ?? CAPACIDAD}
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
        <button type="submit" className="btn btn-sage btn-sm">
          {editando ? "Guardar cambios" : "Crear clase"}
        </button>
        <button type="button" className="btn btn-outline btn-sm" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------------------------
// Confirmación: nunca se elimina al primer toque.
// ---------------------------------------------------------------------------------------------
export function ClaseEliminar({
  clase,
  onConfirmar,
  onCancelar,
}: {
  clase: ClaseAdmin;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  const n = clase.alumnas.length;
  return (
    <div role="alertdialog" aria-labelledby="eliminar-titulo">
      <p className="eyebrow">Eliminar clase</p>
      <h2 id="eliminar-titulo" className="mt-2 pr-10 text-[1.9rem] leading-tight text-taupe-dark sm:text-3xl">
        ¿Seguro que querés eliminar esta clase?
      </h2>

      <div className="mt-5 rounded-2xl border border-line bg-cream px-4 py-4">
        <p className="font-serif text-xl leading-snug text-taupe-dark">{getActividad(clase.actividad).nombre}</p>
        <p className="mt-1 text-sm text-ink-soft">
          {nombreDia(clase.dia)} · {clase.hora} · {clase.profesora}
        </p>
        <p className="mt-3 text-sm text-ink">
          {n === 0 ? "No tiene alumnas anotadas." : n === 1 ? "Tiene 1 alumna anotada." : `Tiene ${n} alumnas anotadas.`}
        </p>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-ink-soft">Esta acción no se puede deshacer.</p>

      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
        <button
          type="button"
          className="btn btn-sm bg-amber-ink text-white hover:bg-taupe-dark"
          onClick={onConfirmar}
        >
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
