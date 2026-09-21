"use client";

import { useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { getActividad, type ActividadId } from "@/lib/data/actividades";
import { ACTIVIDADES_CON_HORARIO, ordenSemanal, type ClaseAdmin } from "@/lib/data/clasesAdmin";
import { DIAS, nombreDia, type Dia } from "@/lib/data/horarios";

interface Props {
  clases: ClaseAdmin[];
  /** Ids de las clases elegidas */
  seleccion: string[];
  onCambiar: (ids: string[]) => void;
  /** Cuántas clases permite el plan */
  max: number;
}

const Chip = ({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    type="button"
    aria-pressed={activo}
    onClick={onClick}
    className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs tracking-wide transition-colors ${
      activo ? "bg-sage-deep text-white" : "bg-cream-alt text-ink-soft hover:text-taupe-dark"
    }`}
  >
    {children}
  </button>
);

const cuposTexto = (libres: number) =>
  libres <= 0 ? "Completa · sin cupos" : libres === 1 ? "1 cupo disponible" : `${libres} cupos disponibles`;

/**
 * Lista para elegir clases. Cada opción muestra actividad, día, horario y cupos disponibles.
 * No permite elegir una clase completa ni más clases de las que incluye el plan.
 */
export function SelectorClases({ clases, seleccion, onCambiar, max }: Props) {
  const [actividad, setActividad] = useState<ActividadId | "todas">("todas");
  const [dia, setDia] = useState<Dia | "todos">("todos");

  const ordenadas = useMemo(() => [...clases].sort((a, b) => ordenSemanal(a) - ordenSemanal(b)), [clases]);
  const visibles = ordenadas.filter((c) => (actividad === "todas" || c.actividad === actividad) && (dia === "todos" || c.dia === dia));
  const elegidas = ordenadas.filter((c) => seleccion.includes(c.id));
  const alTope = seleccion.length >= max;
  const pasado = seleccion.length > max;

  const alternar = (id: string) =>
    onCambiar(seleccion.includes(id) ? seleccion.filter((x) => x !== id) : [...seleccion, id]);

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.15em] text-ink-soft">Clases</p>
        <p className={`text-xs ${pasado ? "font-medium text-amber-ink" : "text-ink-soft"}`} aria-live="polite">
          {seleccion.length} de {max} {max === 1 ? "clase" : "clases"} del plan
        </p>
      </div>

      {elegidas.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Clases elegidas">
          {elegidas.map((c) => (
            <li key={c.id} className="flex items-center gap-1.5 rounded-full bg-sage-soft py-1 pl-3 pr-1 text-xs text-sage-deep">
              <span>
                {getActividad(c.actividad).nombre} · {nombreDia(c.dia).slice(0, 3)} {c.hora}
              </span>
              <button
                type="button"
                onClick={() => alternar(c.id)}
                aria-label={`Quitar ${getActividad(c.actividad).nombre}, ${nombreDia(c.dia)} ${c.hora}`}
                className="grid h-5 w-5 place-items-center rounded-full hover:bg-sage/40"
              >
                <X size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Filtros */}
      <div className="no-scrollbar mt-3 flex gap-1.5 overflow-x-auto" role="group" aria-label="Filtrar por actividad">
        <Chip activo={actividad === "todas"} onClick={() => setActividad("todas")}>
          Todas
        </Chip>
        {ACTIVIDADES_CON_HORARIO.map((a) => (
          <Chip key={a.id} activo={actividad === a.id} onClick={() => setActividad(a.id)}>
            {a.nombre}
          </Chip>
        ))}
      </div>
      <div className="no-scrollbar mt-2 flex gap-1.5 overflow-x-auto" role="group" aria-label="Filtrar por día">
        <Chip activo={dia === "todos"} onClick={() => setDia("todos")}>
          Todos los días
        </Chip>
        {DIAS.map((d) => (
          <Chip key={d.id} activo={dia === d.id} onClick={() => setDia(d.id)}>
            {d.nombre}
          </Chip>
        ))}
      </div>

      {/* Opciones */}
      <ul className="mt-3 max-h-72 divide-y divide-line overflow-y-auto rounded-2xl border border-line bg-paper">
        {visibles.length === 0 && <li className="px-4 py-6 text-center text-sm text-ink-soft">No hay clases con ese filtro.</li>}
        {visibles.map((c) => {
          const activa = seleccion.includes(c.id);
          const libres = c.cupo - c.alumnas.length;
          const bloqueada = !activa && (libres <= 0 || alTope);
          return (
            <li key={c.id}>
              <label
                className={`flex items-center gap-3 px-4 py-3 transition-colors focus-within:ring-2 focus-within:ring-inset focus-within:ring-sage-deep ${
                  bloqueada ? "cursor-not-allowed opacity-55" : "cursor-pointer hover:bg-sage-mist"
                } ${activa ? "bg-sage-mist" : ""}`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={activa}
                  disabled={bloqueada}
                  onChange={() => alternar(c.id)}
                />
                <span
                  aria-hidden
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border ${
                    activa ? "border-sage-deep bg-sage-deep text-white" : "border-taupe/50 bg-paper"
                  }`}
                >
                  {activa && <Check size={13} strokeWidth={3} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-taupe-dark">{getActividad(c.actividad).nombre}</span>
                  <span className="block text-xs text-ink-soft">
                    {nombreDia(c.dia)} · {c.hora}
                  </span>
                  <span className={`block text-xs ${libres <= 0 ? "font-medium text-amber-ink" : "text-ink-soft"}`}>
                    {cuposTexto(libres)}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      {alTope && !pasado && (
        <p className="mt-2 text-xs text-ink-soft">Ya elegiste todas las clases del plan. Sacá una para elegir otra.</p>
      )}
    </div>
  );
}
