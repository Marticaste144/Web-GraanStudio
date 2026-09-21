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
    <div className="flex flex-col items-start gap-1.5">
      <span className="flex gap-[3px]" aria-hidden>
        {Array.from({ length: CAPACIDAD }, (_, i) => (
          <span key={i} className={`h-1.5 w-1.5 rounded-full ${i < ocupadas ? "bg-taupe" : "bg-line"}`} />
        ))}
      </span>
      <span className="text-[0.7rem] text-ink-soft">
        {libres === 0
          ? `Completo · ${CAPACIDAD}/${CAPACIDAD}`
          : libres === 1
            ? "Último lugar"
            : `${libres} lugares`}
      </span>
    </div>
  );
}

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
    <li className="flex items-center gap-4 py-3">
      <span className="w-14 shrink-0 font-serif text-2xl leading-none text-taupe-dark">{clase.hora}</span>
      <div className="min-w-0 flex-1">
        <Cupo ocupadas={ocupadas} />
      </div>
      {completa ? (
        esperando ? (
          <span className="pop inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-amber-soft px-3.5 py-2 text-xs font-medium text-amber-ink">
            <Clock size={13} /> En espera
          </span>
        ) : (
          <button
            className="btn btn-outline btn-sm whitespace-nowrap"
            onClick={() => {
              esperar(clase);
              toast(`Te sumamos a la lista de espera de ${nombre}, ${nombreDia(clase.dia)} ${clase.hora}. Te avisamos si se libera un lugar.`);
            }}
          >
            Lista de espera
          </button>
        )
      ) : anotada ? (
        <span className="pop inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-sage-soft px-3.5 py-2 text-xs font-medium text-sage-dark">
          <Check size={14} strokeWidth={2.5} /> ¡Anotada!
        </span>
      ) : (
        <button
          className="btn btn-primary btn-sm whitespace-nowrap"
          onClick={() => {
            anotar(clase);
            toast(`¡Listo! Quedaste anotada a ${nombre}, ${nombreDia(clase.dia)} ${clase.hora}.`);
          }}
        >
          Anotarme
        </button>
      )}
    </li>
  );
}

function PanelConsulta({ actividad }: { actividad: Actividad }) {
  const toast = useToast();
  const [enviada, setEnviada] = useState(false);
  return (
    <div className="rounded-3xl border border-line bg-paper p-6 sm:p-8">
      <p className="eyebrow">Clase especial</p>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-soft">
        {actividad.nombre} se coordina a consulta: nos escribís y armamos juntas el día y el horario que mejor te quede.
      </p>
      {enviada ? (
        <span className="pop mt-6 inline-flex items-center gap-1.5 rounded-full bg-sage-soft px-5 py-3 text-sm font-medium text-sage-dark">
          <Check size={16} strokeWidth={2.5} /> Consulta enviada
        </span>
      ) : (
        <button
          className="btn btn-primary mt-6"
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

      <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[18rem_minmax(0,1fr)]">
        {/* Selector de actividad: chips en celular/tablet, lista lateral en escritorio */}
        <aside className="min-w-0">
          <div
            role="tablist"
            aria-label="Actividades"
            className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-8 sm:px-8 lg:sticky lg:top-28 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0"
          >
            {ACTIVIDADES.map((a, i) => {
              const on = a.id === seleccion;
              return (
                <div key={a.id} className="contents">
                  {a.aConsulta && !ACTIVIDADES[i - 1]?.aConsulta && (
                    <p className="eyebrow hidden pb-2 pt-7 lg:block">Para embarazadas</p>
                  )}
                  <button
                    role="tab"
                    aria-selected={on}
                    onClick={() => elegir(a.id)}
                    className={`flex shrink-0 items-center gap-3 whitespace-nowrap rounded-full border px-4 py-2.5 text-sm transition-colors lg:rounded-none lg:border-0 lg:border-b lg:px-2 lg:py-3.5 ${
                      on
                        ? "border-taupe-dark bg-taupe-dark text-cream lg:border-taupe-dark lg:bg-transparent lg:text-taupe-dark"
                        : "border-line bg-paper text-ink-soft hover:text-taupe-dark lg:border-line lg:bg-transparent"
                    }`}
                  >
                    <ActividadIcon icono={a.icono} size={18} className={`hidden lg:block ${on ? "text-sage-dark" : "text-taupe"}`} />
                    <span className={`lg:flex-1 lg:text-left lg:font-serif lg:text-lg ${on ? "lg:font-medium" : ""}`}>
                      {a.nombre}
                    </span>
                    {!a.aConsulta && (
                      <span className="hidden text-xs text-ink-soft lg:block">{cantidad(a)}</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </aside>

        <section aria-label={`Horarios de ${actividad.nombre}`} className="min-w-0">
          <div className="flex items-start gap-4">
            <span className="hidden h-14 w-14 shrink-0 place-items-center rounded-full bg-cream-alt text-taupe-dark sm:grid">
              <ActividadIcon icono={actividad.icono} size={26} />
            </span>
            <div>
              <h2 className="text-3xl text-taupe-dark md:text-4xl">{actividad.nombre}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">{actividad.descripcion}</p>
            </div>
          </div>

          {actividad.aConsulta ? (
            <div className="mt-8">
              <PanelConsulta actividad={actividad} />
            </div>
          ) : (
            <>
              <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto">
                {[{ id: "todos" as const, nombre: "Todos los días" }, ...diasConClases].map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDiaFiltro(d.id)}
                    aria-pressed={diaFiltro === d.id}
                    className={`shrink-0 rounded-full px-4 py-2 text-xs tracking-wide transition-colors ${
                      diaFiltro === d.id
                        ? "bg-sage-dark text-white"
                        : "bg-cream-alt text-ink-soft hover:text-taupe-dark"
                    }`}
                  >
                    {d.nombre}
                  </button>
                ))}
              </div>

              {visibles.length > 0 ? (
                <div
                  className={`mt-6 grid gap-x-8 gap-y-10 ${
                    diaFiltro === "todos" ? "sm:grid-cols-2 xl:grid-cols-3" : "max-w-md"
                  }`}
                >
                  {visibles.map((d) => (
                    <div key={d.id} className="min-w-0">
                      <h3 className="border-b border-taupe/30 pb-2 font-serif text-2xl text-taupe-dark">{d.nombre}</h3>
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
