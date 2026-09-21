"use client";

import { useState } from "react";
import { Check, Clock } from "lucide-react";
import { ActividadIcon } from "@/components/ui/ActividadIcon";
import { useToast } from "@/components/ui/Toast";
import { ACTIVIDADES, getActividad, type Actividad, type ActividadId } from "@/lib/data/actividades";
import { CAPACIDAD, ocupadasDe } from "@/lib/data/cupos";
import { claveClase, clasesDeActividad, DIAS, nombreDia, type Clase, type Dia } from "@/lib/data/horarios";
import { useAlumno } from "./AlumnoProvider";
import { PageHeader } from "./PageHeader";

function Cupo({ ocupadas }: { ocupadas: number }) {
  const libres = CAPACIDAD - ocupadas;
  return (
    <div className="flex flex-col items-start gap-1.5 whitespace-nowrap">
      <span className="flex gap-[3px]" aria-hidden>
        {Array.from({ length: CAPACIDAD }, (_, i) => (
          <span key={i} className={`h-1.5 w-1.5 rounded-full ${i < ocupadas ? "bg-taupe" : "bg-line"}`} />
        ))}
      </span>
      <span className={`text-xs ${libres === 0 ? "font-medium text-amber-ink" : "text-ink-soft"}`}>
        {libres === 0
          ? `Completo · ${CAPACIDAD}/${CAPACIDAD}`
          : libres === 1
            ? "Último lugar"
            : `${libres} lugares`}
      </span>
    </div>
  );
}

/**
 * Una fila de horario. Dos bloques: [hora + cupo] y [acción]. Si el ancho no alcanza, la acción
 * baja a la línea siguiente (flex-wrap) en lugar de comprimirse o superponerse.
 */
function FilaClase({ clase }: { clase: Clase }) {
  const { anotadasAhora, enEspera, anotar, esperar } = useAlumno();
  const toast = useToast();
  const k = claveClase(clase.dia, clase.hora);
  const anotada = anotadasAhora.has(k);
  const esperando = enEspera.has(k);
  const nombre = getActividad(clase.actividad).nombre;

  // Si se anotó en el demo, ocupa un lugar más.
  const ocupadas = Math.min(CAPACIDAD, ocupadasDe(clase) + (anotada ? 1 : 0));
  const completa = ocupadasDe(clase) >= CAPACIDAD;

  return (
    <li className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2.5 py-3">
      <div className="flex items-center gap-4">
        <span className="w-[3.3rem] shrink-0 font-serif text-2xl leading-none text-taupe-dark">{clase.hora}</span>
        <Cupo ocupadas={ocupadas} />
      </div>

      <div className="shrink-0">
        {completa ? (
          esperando ? (
            <span className="pop inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-amber-soft px-3.5 py-2 text-xs font-medium text-amber-ink">
              <Clock size={13} /> En espera
            </span>
          ) : (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                esperar(clase);
                toast(`Te sumamos a la lista de espera de ${nombre}, ${nombreDia(clase.dia)} ${clase.hora}. Te avisamos si se libera un lugar.`);
              }}
            >
              Lista de espera
            </button>
          )
        ) : anotada ? (
          <span className="pop inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-sage-soft px-3.5 py-2 text-xs font-medium text-sage-deep">
            <Check size={14} strokeWidth={2.5} /> ¡Anotada!
          </span>
        ) : (
          <button
            className="btn btn-sage btn-sm"
            onClick={() => {
              anotar(clase);
              toast(`¡Listo! Quedaste anotada a ${nombre}, ${nombreDia(clase.dia)} ${clase.hora}.`);
            }}
          >
            Anotarme
          </button>
        )}
      </div>
    </li>
  );
}

function PanelConsulta({ actividad }: { actividad: Actividad }) {
  const toast = useToast();
  const [enviada, setEnviada] = useState(false);
  return (
    <div className="rounded-3xl border border-sage/40 bg-sage-mist p-6 sm:p-8">
      <p className="eyebrow">Clase especial</p>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-soft">
        {actividad.nombre} se coordina a consulta: nos escribís y armamos juntas el día y el horario que mejor te quede.
      </p>
      {enviada ? (
        <span className="pop mt-6 inline-flex items-center gap-1.5 rounded-full bg-sage-soft px-5 py-3 text-sm font-medium text-sage-deep">
          <Check size={16} strokeWidth={2.5} /> Consulta enviada
        </span>
      ) : (
        <button
          className="btn btn-sage mt-6"
          onClick={() => {
            setEnviada(true);
            toast(`Recibimos tu consulta por ${actividad.nombre}. Te vamos a escribir para coordinar.`);
          }}
        >
          Consultar
        </button>
      )}
    </div>
  );
}

export function VerClases() {
  const { yaTenia, misClases } = useAlumno();
  const [seleccion, setSeleccion] = useState<ActividadId>("pilates-reformer");
  const [diaFiltro, setDiaFiltro] = useState<Dia | "todos">("todos");

  const actividad = getActividad(seleccion);
  const disponibles = clasesDeActividad(seleccion).filter((c) => !yaTenia.has(claveClase(c.dia, c.hora)));
  const diasConClases = DIAS.filter((d) => disponibles.some((c) => c.dia === d.id));
  const visibles = diasConClases.filter((d) => diaFiltro === "todos" || d.id === diaFiltro);

  const elegir = (id: ActividadId) => {
    setSeleccion(id);
    setDiaFiltro("todos");
  };

  const cantidad = (a: Actividad) =>
    clasesDeActividad(a.id).filter((c) => !yaTenia.has(claveClase(c.dia, c.hora))).length;

  return (
    <main>
      <PageHeader
        eyebrow="Reservar"
        titulo="Clases disponibles"
        subtitulo={
          misClases.length > 0
            ? "Elegí una actividad, mirá los horarios y anotate en los que quieras sumar."
            : "Elegí una actividad, mirá los horarios y anotate en los que quieras."
        }
      />

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[17rem_minmax(0,1fr)]">
        {/* Selector de actividad: chips en celular/tablet, lista lateral en escritorio */}
        <aside className="min-w-0">
          <div
            role="tablist"
            aria-label="Actividades"
            className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-8 sm:px-8 lg:sticky lg:top-28 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0"
          >
            {ACTIVIDADES.map((a, i) => {
              const on = a.id === seleccion;
              return (
                <div key={a.id} className="contents">
                  {a.aConsulta && !ACTIVIDADES[i - 1]?.aConsulta && (
                    <p className="eyebrow hidden pb-1 pl-3 pt-6 lg:block">Para embarazadas</p>
                  )}
                  <button
                    role="tab"
                    aria-selected={on}
                    onClick={() => elegir(a.id)}
                    className={`flex shrink-0 items-center gap-3 whitespace-nowrap rounded-full border px-4 py-2.5 text-sm transition-colors lg:rounded-xl lg:border-0 lg:px-3 lg:py-3 ${
                      on
                        ? "border-sage-deep bg-sage-deep text-white lg:bg-sage-soft lg:text-taupe-dark"
                        : "border-line bg-paper text-ink-soft hover:text-taupe-dark lg:bg-transparent lg:hover:bg-cream-alt"
                    }`}
                  >
                    <ActividadIcon
                      icono={a.icono}
                      size={18}
                      className={`hidden lg:block ${on ? "text-sage-deep" : "text-taupe"}`}
                    />
                    <span className={`lg:flex-1 lg:text-left lg:font-serif lg:text-lg ${on ? "lg:font-medium" : ""}`}>
                      {a.nombre}
                    </span>
                    {!a.aConsulta && <span className="hidden text-xs text-ink-soft lg:block">{cantidad(a)}</span>}
                  </button>
                </div>
              );
            })}
          </div>
        </aside>

        <section aria-label={`Horarios de ${actividad.nombre}`} className="min-w-0">
          <div className="flex items-start gap-4">
            <span className="hidden h-12 w-12 shrink-0 place-items-center rounded-full bg-sage-soft text-sage-deep sm:grid">
              <ActividadIcon icono={actividad.icono} size={24} />
            </span>
            <div className="min-w-0">
              <h2 className="text-3xl text-taupe-dark md:text-[2.2rem]">{actividad.nombre}</h2>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-soft">{actividad.descripcion}</p>
            </div>
          </div>

          {actividad.aConsulta ? (
            <div className="mt-6">
              <PanelConsulta actividad={actividad} />
            </div>
          ) : (
            <>
              <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto">
                {[{ id: "todos" as const, nombre: "Todos los días" }, ...diasConClases].map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDiaFiltro(d.id)}
                    aria-pressed={diaFiltro === d.id}
                    className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs tracking-wide transition-colors ${
                      diaFiltro === d.id
                        ? "bg-taupe-dark text-cream"
                        : "bg-cream-alt text-ink-soft hover:text-taupe-dark"
                    }`}
                  >
                    {d.nombre}
                  </button>
                ))}
              </div>

              {visibles.length > 0 ? (
                // Las columnas se calculan según el ancho disponible: cada día tiene como mínimo ~19 rem,
                // así una fila nunca queda más angosta de lo que necesita.
                <div className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(min(100%,19.5rem),1fr))] gap-4">
                  {visibles.map((d) => (
                    <div key={d.id} className="min-w-0 rounded-2xl border border-line bg-paper px-4 pb-1 pt-3.5 sm:px-5">
                      <h3 className="border-b border-taupe/25 pb-2 font-serif text-xl text-taupe-dark">{d.nombre}</h3>
                      <ul className="divide-y divide-line/70">
                        {disponibles
                          .filter((c) => c.dia === d.id)
                          .map((c) => (
                            <FilaClase key={claveClase(c.dia, c.hora)} clase={c} />
                          ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-8 text-sm text-ink-soft">Ya estás anotada a todos los horarios de esta actividad.</p>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
