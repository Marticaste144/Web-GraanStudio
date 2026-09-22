"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { DIAS, nombreDia, type Dia } from "@/lib/data/horarios";
import {
  crearClaseRecurrenteAction,
  editarClaseRecurrenteAction,
  eliminarClaseRecurrenteAction,
  type DatosClaseRecurrente,
} from "@/lib/clases/actions";
import { AdminHeader, Metrica, Tarjeta } from "./AdminUI";
import { ClaseRecurrenteDetalle, ClaseRecurrenteEliminar, ClaseRecurrenteFormulario, HORAS_DISPONIBLES } from "./ClaseRecurrenteVistas";

export interface ClaseRecurrenteVista {
  id: string;
  dia: string;
  hora: string;
  cupo: number;
  disciplinaId: string;
  disciplinaNombre: string;
  profesoraId: string;
  profesoraNombre: string;
}

export interface Disciplina {
  id: string;
  nombre: string;
  aConsulta: boolean;
}

export interface Profesora {
  id: string;
  nombre: string;
}

type Panel = { tipo: "crear" } | { tipo: "detalle" | "editar" | "eliminar"; id: string } | null;

function Celda({ clase, filtro, onAbrir }: { clase: ClaseRecurrenteVista; filtro: string | "todas"; onAbrir: () => void }) {
  const apagada = filtro !== "todas" && filtro !== clase.disciplinaId;
  return (
    <button
      type="button"
      onClick={onAbrir}
      aria-label={`Ver detalle: ${clase.disciplinaNombre}, ${nombreDia(clase.dia as Dia)} ${clase.hora}, con ${clase.profesoraNombre}`}
      className={`block w-full rounded-lg border-l-[3px] border-sage-deep bg-sage-soft/70 px-3 py-2 text-left transition hover:shadow-sm hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-deep ${
        apagada ? "opacity-25" : ""
      }`}
    >
      <span className="block text-xs font-medium leading-tight text-ink">{clase.disciplinaNombre}</span>
      <span className="mt-1 block text-[0.7rem] text-ink-soft">{clase.profesoraNombre}</span>
    </button>
  );
}

/**
 * Grilla semanal real (Bloque 2): disciplinas, profesoras y horarios vienen de Supabase.
 * Todavía no hay ocupación/alumnas: eso se conecta cuando llegue la importación de alumnas.
 */
export function ClasesRecurrentesAdmin({
  clasesIniciales,
  disciplinas,
  profesoras,
}: {
  clasesIniciales: ClaseRecurrenteVista[];
  disciplinas: Disciplina[];
  profesoras: Profesora[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [, iniciarTransicion] = useTransition();
  const [panel, setPanel] = useState<Panel>(null);
  const [filtro, setFiltro] = useState<string>("todas");
  const [dia, setDia] = useState<Dia>("lunes");

  // Los datos vienen del servidor por prop; tras crear/editar/eliminar se pide router.refresh().
  const clases = clasesIniciales;

  const claseDe = (id: string) => clases.find((c) => c.id === id);
  const seleccionada = panel && panel.tipo !== "crear" ? claseDe(panel.id) : undefined;
  const cerrar = () => setPanel(null);

  const enGrilla = (d: Dia, h: string) => clases.find((c) => c.dia === d && c.hora === h);
  const horaVacia = (h: string) => !clases.some((c) => c.hora === h);
  const indice = DIAS.findIndex((d) => d.id === dia);

  const disciplinasConHorario = disciplinas.filter((d) => !d.aConsulta);

  const guardarNueva = async (datos: DatosClaseRecurrente) => {
    const r = await crearClaseRecurrenteAction(datos);
    if (r.ok) {
      setFiltro("todas");
      setDia(datos.dia as Dia);
      cerrar();
      toast("Clase creada.");
      iniciarTransicion(() => router.refresh());
    }
    return r;
  };

  const guardarEdicion = async (id: string, datos: DatosClaseRecurrente) => {
    const r = await editarClaseRecurrenteAction(id, datos);
    if (r.ok) {
      setDia(datos.dia as Dia);
      setPanel({ tipo: "detalle", id });
      toast("Clase actualizada.");
      iniciarTransicion(() => router.refresh());
    }
    return r;
  };

  const confirmarEliminar = async () => {
    if (!seleccionada) return;
    const r = await eliminarClaseRecurrenteAction(seleccionada.id);
    cerrar();
    if (r.ok) {
      toast(`Clase eliminada: ${seleccionada.disciplinaNombre}, ${nombreDia(seleccionada.dia as Dia)} ${seleccionada.hora}.`);
      iniciarTransicion(() => router.refresh());
    } else {
      toast(r.error);
    }
  };

  return (
    <main className="mx-auto max-w-[90rem] px-4 pb-16 pt-8 sm:px-8 lg:px-10 lg:pt-12">
      <AdminHeader
        titulo="Clases"
        subtitulo="Horario semanal real del estudio: disciplinas, profesoras y horarios."
        accion={
          <button type="button" className="btn btn-primary w-full sm:w-auto" onClick={() => setPanel({ tipo: "crear" })}>
            <Plus size={17} />
            Nueva clase
          </button>
        }
      />

      <div className="mt-8 grid gap-4 min-[560px]:grid-cols-3 lg:gap-5">
        <Metrica etiqueta="Clases por semana" valor={String(clases.length)} nota="de lunes a viernes" />
        <Metrica etiqueta="Profesoras activas" valor={String(profesoras.length)} nota="asignables a clases" tono="sage" />
        <Metrica etiqueta="Disciplinas" valor={String(disciplinas.length)} nota="incluye a consultar" />
      </div>

      <div className="mt-5 lg:mt-6">
        <Tarjeta titulo="Grilla semanal" subtitulo="Tocá una clase para ver sus datos, editarla o eliminarla">
          <div className="no-scrollbar flex gap-2 overflow-x-auto" role="group" aria-label="Filtrar por disciplina">
            {[{ id: "todas", nombre: "Todas" }, ...disciplinasConHorario].map((d) => (
              <button
                key={d.id}
                aria-pressed={filtro === d.id}
                onClick={() => setFiltro(d.id)}
                className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs tracking-wide transition-colors ${
                  filtro === d.id ? "bg-sage-deep text-white" : "bg-cream-alt text-ink-soft hover:text-taupe-dark"
                }`}
              >
                {d.nombre}
              </button>
            ))}
          </div>

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
          titulo={
            panel.tipo === "crear"
              ? "Nueva clase"
              : `${seleccionada!.disciplinaNombre}, ${nombreDia(seleccionada!.dia as Dia)} ${seleccionada!.hora}`
          }
          onCerrar={cerrar}
        >
          {panel.tipo === "crear" && (
            <ClaseRecurrenteFormulario
              disciplinas={disciplinas}
              profesoras={profesoras}
              onGuardar={guardarNueva}
              onCancelar={cerrar}
            />
          )}
          {panel.tipo === "detalle" && seleccionada && (
            <ClaseRecurrenteDetalle
              clase={seleccionada}
              onEditar={() => setPanel({ tipo: "editar", id: seleccionada.id })}
              onEliminar={() => setPanel({ tipo: "eliminar", id: seleccionada.id })}
            />
          )}
          {panel.tipo === "editar" && seleccionada && (
            <ClaseRecurrenteFormulario
              inicial={seleccionada}
              disciplinas={disciplinas}
              profesoras={profesoras}
              onGuardar={(d) => guardarEdicion(seleccionada.id, d)}
              onCancelar={() => setPanel({ tipo: "detalle", id: seleccionada.id })}
            />
          )}
          {panel.tipo === "eliminar" && seleccionada && (
            <ClaseRecurrenteEliminar clase={seleccionada} onCancelar={() => setPanel({ tipo: "detalle", id: seleccionada.id })} onConfirmar={confirmarEliminar} />
          )}
        </Modal>
      )}
    </main>
  );
}
