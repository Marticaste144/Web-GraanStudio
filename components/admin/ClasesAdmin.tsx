"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { getActividad, type ActividadId } from "@/lib/data/actividades";
import {
  ACTIVIDADES_CON_HORARIO,
  estaLlena,
  HORAS_DISPONIBLES,
  ocupacionPromedio,
  type ClaseAdmin,
  type DatosClase,
} from "@/lib/data/clasesAdmin";
import { DIAS, nombreDia, type Dia } from "@/lib/data/horarios";
import { AdminHeader, Metrica, Tarjeta } from "./AdminUI";
import { ClaseDetalle, ClaseEliminar, ClaseFormulario } from "./ClaseVistas";
import { useClasesAdmin } from "./ClasesProvider";

type Panel =
  | { tipo: "crear" }
  | { tipo: "detalle" | "editar" | "eliminar"; id: string }
  | null;

/** Casi llena a partir del 75 % del cupo. */
function estilo(c: ClaseAdmin) {
  if (estaLlena(c)) return "border-amber-ink/70 bg-amber-soft/70";
  if (c.alumnas.length / c.cupo >= 0.75) return "border-taupe bg-cream-alt";
  return "border-sage-deep bg-sage-soft/70";
}

function Celda({
  clase,
  filtro,
  onAbrir,
}: {
  clase: ClaseAdmin;
  filtro: ActividadId | "todas";
  onAbrir: () => void;
}) {
  const apagada = filtro !== "todas" && filtro !== clase.actividad;
  const nombre = getActividad(clase.actividad).nombre;
  return (
    <button
      type="button"
      onClick={onAbrir}
      aria-label={`Ver detalle: ${nombre}, ${nombreDia(clase.dia)} ${clase.hora}, ${clase.alumnas.length} de ${clase.cupo} anotadas`}
      className={`block w-full rounded-lg border-l-[3px] px-3 py-2 text-left transition hover:shadow-sm hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-deep ${estilo(clase)} ${
        apagada ? "opacity-25" : ""
      }`}
    >
      <span className="block text-xs font-medium leading-tight text-ink">{nombre}</span>
      <span className="mt-1 block text-[0.7rem] tabular-nums text-ink-soft">
        {clase.alumnas.length}/{clase.cupo} anotadas
      </span>
    </button>
  );
}

export function ClasesAdmin() {
  const toast = useToast();
  const { clases, crear, editar, eliminar } = useClasesAdmin();
  const [panel, setPanel] = useState<Panel>(null);
  const [filtro, setFiltro] = useState<ActividadId | "todas">("todas");
  const [dia, setDia] = useState<Dia>("lunes");

  const claseDe = (id: string) => clases.find((c) => c.id === id);
  const seleccionada = panel && panel.tipo !== "crear" ? claseDe(panel.id) : undefined;
  const cerrar = () => setPanel(null);

  // Lookup rápido de la grilla: hora → día → clase
  const enGrilla = (d: Dia, h: string) => clases.find((c) => c.dia === d && c.hora === h);
  const horaVacia = (h: string) => !clases.some((c) => c.hora === h);
  const indice = DIAS.findIndex((d) => d.id === dia);
  const completas = clases.filter(estaLlena).length;

  const guardarNueva = (datos: DatosClase) => {
    const r = crear(datos);
    if (r.ok) {
      setFiltro("todas");
      setDia(datos.dia); // en celular/tablet, mostrar el día donde quedó la nueva clase
      cerrar();
      toast(`Clase creada: ${getActividad(datos.actividad).nombre}, ${nombreDia(datos.dia)} ${datos.hora}.`);
    }
    return r;
  };

  const guardarEdicion = (id: string, datos: DatosClase) => {
    const r = editar(id, datos);
    if (r.ok) {
      setDia(datos.dia);
      setPanel({ tipo: "detalle", id });
      toast("Clase actualizada.");
    }
    return r;
  };

  return (
    <main className="mx-auto max-w-[90rem] px-4 pb-16 pt-8 sm:px-8 lg:px-10 lg:pt-12">
      <AdminHeader
        titulo="Clases"
        subtitulo="La semana del estudio y la ocupación de cada horario."
        accion={
          <button type="button" className="btn btn-primary w-full sm:w-auto" onClick={() => setPanel({ tipo: "crear" })}>
            <Plus size={17} />
            Nueva clase
          </button>
        }
      />

      <div className="mt-8 grid gap-4 min-[560px]:grid-cols-3 lg:gap-5">
        <Metrica etiqueta="Clases por semana" valor={String(clases.length)} nota="de lunes a viernes" />
        <Metrica etiqueta="Clases completas" valor={String(completas)} nota="con el cupo completo" tono="sage" />
        <Metrica etiqueta="Ocupación promedio" valor={`${ocupacionPromedio(clases)}%`} nota="de todos los horarios" />
      </div>

      <div className="mt-5 lg:mt-6">
        <Tarjeta titulo="Grilla semanal" subtitulo="Tocá una clase para ver sus alumnas, editarla o eliminarla">
          <div className="no-scrollbar flex gap-2 overflow-x-auto" role="group" aria-label="Filtrar por actividad">
            {[{ id: "todas" as const, nombre: "Todas" }, ...ACTIVIDADES_CON_HORARIO].map((a) => (
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
                {HORAS_DISPONIBLES.map((h) =>
                  horaVacia(h) ? (
                    <tr key={h} className="border-b border-line/70 last:border-0">
                      <td className="p-3 font-serif text-lg text-taupe">{h}</td>
                      <td colSpan={5} className="p-2 text-center text-xs italic text-ink-soft">
                        Sin actividad
                      </td>
                    </tr>
                  ) : (
                    <tr key={h} className="border-b border-line/70 last:border-0">
                      <td className="p-3 font-serif text-lg text-taupe">{h}</td>
                      {DIAS.map((d) => {
                        const c = enGrilla(d.id, h);
                        return (
                          <td key={d.id} className="p-1.5 align-top">
                            {c ? (
                              <Celda clase={c} filtro={filtro} onAbrir={() => setPanel({ tipo: "detalle", id: c.id })} />
                            ) : (
                              <p className="px-3 py-2 text-ink-soft/50">—</p>
                            )}
                          </td>
                        );
                      })}
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
              {HORAS_DISPONIBLES.map((h) => {
                if (horaVacia(h)) {
                  return (
                    <li key={h} className="flex items-center gap-4 px-4 py-3">
                      <span className="w-14 font-serif text-xl text-taupe">{h}</span>
                      <span className="text-sm italic text-ink-soft">Sin actividad</span>
                    </li>
                  );
                }
                const c = enGrilla(DIAS[indice].id, h);
                return (
                  <li key={h} className="flex items-start gap-4 px-4 py-3">
                    <span className="w-14 shrink-0 pt-1 font-serif text-xl text-taupe">{h}</span>
                    <div className="min-w-0 flex-1">
                      {c ? (
                        <Celda clase={c} filtro={filtro} onAbrir={() => setPanel({ tipo: "detalle", id: c.id })} />
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
      </div>

      {panel && (panel.tipo === "crear" || seleccionada) && (
        <Modal
          titulo={panel.tipo === "crear" ? "Nueva clase" : `${getActividad(seleccionada!.actividad).nombre}, ${nombreDia(seleccionada!.dia)} ${seleccionada!.hora}`}
          onCerrar={cerrar}
        >
          {panel.tipo === "crear" && <ClaseFormulario onGuardar={guardarNueva} onCancelar={cerrar} />}
          {panel.tipo === "detalle" && seleccionada && (
            <ClaseDetalle
              clase={seleccionada}
              onEditar={() => setPanel({ tipo: "editar", id: seleccionada.id })}
              onEliminar={() => setPanel({ tipo: "eliminar", id: seleccionada.id })}
            />
          )}
          {panel.tipo === "editar" && seleccionada && (
            <ClaseFormulario
              inicial={seleccionada}
              onGuardar={(d) => guardarEdicion(seleccionada.id, d)}
              onCancelar={() => setPanel({ tipo: "detalle", id: seleccionada.id })}
            />
          )}
          {panel.tipo === "eliminar" && seleccionada && (
            <ClaseEliminar
              clase={seleccionada}
              onCancelar={() => setPanel({ tipo: "detalle", id: seleccionada.id })}
              onConfirmar={() => {
                eliminar(seleccionada.id);
                cerrar();
                toast(`Clase eliminada: ${getActividad(seleccionada.actividad).nombre}, ${nombreDia(seleccionada.dia)} ${seleccionada.hora}.`);
              }}
            />
          )}
        </Modal>
      )}
    </main>
  );
}
