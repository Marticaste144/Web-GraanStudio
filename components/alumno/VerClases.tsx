"use client";

import { useState } from "react";
import { Check, ChevronDown, Clock } from "lucide-react";
import { ActividadIcon } from "@/components/ui/ActividadIcon";
import { useToast } from "@/components/ui/Toast";
import { ACTIVIDADES, type Actividad } from "@/lib/data/actividades";
import { CLASES_DE_ALUMNA } from "@/lib/data/alumna";
import { CAPACIDAD, ocupadasDe } from "@/lib/data/cupos";
import { claveClase, clasesDeActividad, DIAS, nombreDia, type Clase } from "@/lib/data/horarios";
import { useAlumno } from "./AlumnoProvider";

// Horarios que Sofía ya tenía antes del demo: no se ofrecen de nuevo.
const YA_ANOTADA = new Set(CLASES_DE_ALUMNA.map((c) => claveClase(c.dia, c.hora)));

function Cupo({ ocupadas }: { ocupadas: number }) {
  const libres = CAPACIDAD - ocupadas;
  return (
    <div className="flex flex-col items-start gap-1.5">
      <span className="flex gap-[3px]" aria-hidden>
        {Array.from({ length: CAPACIDAD }, (_, i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 rounded-full ${i < ocupadas ? "bg-taupe" : "bg-line"}`}
          />
        ))}
      </span>
      <span className="text-[0.7rem] text-ink-soft">
        {libres === 0
          ? `Completo · ${CAPACIDAD}/${CAPACIDAD}`
          : libres === 1
            ? "Último lugar"
            : `${libres} lugares disponibles`}
      </span>
    </div>
  );
}

function FilaClase({ clase }: { clase: Clase }) {
  const { nuevas, enEspera, anotar, esperar } = useAlumno();
  const toast = useToast();
  const k = claveClase(clase.dia, clase.hora);
  const anotada = nuevas.has(k);
  const esperando = enEspera.has(k);
  const nombre = ACTIVIDADES.find((a) => a.id === clase.actividad)!.nombre;

  // Si se anotó en el demo, ocupa un lugar más.
  const ocupadas = Math.min(CAPACIDAD, ocupadasDe(clase) + (anotada ? 1 : 0));
  const completa = ocupadasDe(clase) >= CAPACIDAD;

  return (
    <li className="flex items-center gap-4 py-3">
      <span className="w-14 shrink-0 font-serif text-2xl leading-none text-taupe-dark">{clase.hora}</span>
      <div className="flex-1">
        <Cupo ocupadas={ocupadas} />
      </div>
      {completa ? (
        esperando ? (
          <span className="pop inline-flex items-center gap-1.5 rounded-full bg-amber-soft px-3.5 py-2 text-xs font-medium text-amber-ink">
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
        <span className="pop inline-flex items-center gap-1.5 rounded-full bg-sage-soft px-3.5 py-2 text-xs font-medium text-sage-dark">
          <Check size={14} strokeWidth={2.5} /> ¡Anotada!
        </span>
      ) : (
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            anotar(clase);
            toast(`¡Listo! Quedaste anotada a ${nombre}, ${nombreDia(clase.dia)} ${clase.hora}, todas las semanas.`);
          }}
        >
          Anotarme
        </button>
      )}
    </li>
  );
}

function SeccionActividad({
  actividad,
  abierta,
  onToggle,
}: {
  actividad: Actividad;
  abierta: boolean;
  onToggle: () => void;
}) {
  const clases = clasesDeActividad(actividad.id).filter((c) => !YA_ANOTADA.has(claveClase(c.dia, c.hora)));
  const porDia = DIAS.map((d) => ({ dia: d, clases: clases.filter((c) => c.dia === d.id) })).filter(
    (g) => g.clases.length > 0,
  );

  return (
    <section className="border-b border-line">
      <button
        onClick={onToggle}
        aria-expanded={abierta}
        className="flex w-full items-center gap-4 px-5 py-5 text-left"
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-cream-alt text-taupe-dark">
          <ActividadIcon icono={actividad.icono} size={20} />
        </span>
        <span className="flex-1">
          <span className="block font-serif text-[1.6rem] leading-none text-taupe-dark">{actividad.nombre}</span>
          <span className="mt-1 block text-xs text-ink-soft">
            {clases.length} {clases.length === 1 ? "horario" : "horarios"}
          </span>
        </span>
        <ChevronDown
          size={20}
          className={`shrink-0 text-taupe transition-transform ${abierta ? "rotate-180" : ""}`}
        />
      </button>

      {abierta && (
        <div className="px-5 pb-6">
          <p className="mb-4 text-sm leading-relaxed text-ink-soft">{actividad.descripcion}</p>
          {porDia.map(({ dia, clases }) => (
            <div key={dia.id} className="mt-3 first:mt-0">
              <h3 className="eyebrow border-b border-line pb-2 font-sans">{dia.nombre}</h3>
              <ul className="divide-y divide-line/60">
                {clases.map((c) => (
                  <FilaClase key={claveClase(c.dia, c.hora)} clase={c} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ClaseAConsulta({ actividad }: { actividad: Actividad }) {
  const toast = useToast();
  const [enviada, setEnviada] = useState(false);
  return (
    <li className="flex items-center gap-4 border-b border-line px-5 py-5">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sage-soft text-sage-dark">
        <ActividadIcon icono={actividad.icono} size={20} />
      </span>
      <div className="flex-1">
        <p className="font-serif text-[1.6rem] leading-none text-taupe-dark">{actividad.nombre}</p>
        <p className="mt-1 text-xs leading-relaxed text-ink-soft">Sin horario fijo · se coordina a consulta</p>
      </div>
      {enviada ? (
        <span className="pop inline-flex items-center gap-1.5 rounded-full bg-sage-soft px-3.5 py-2 text-xs font-medium text-sage-dark">
          <Check size={14} strokeWidth={2.5} /> Enviada
        </span>
      ) : (
        <button
          className="btn btn-outline btn-sm"
          onClick={() => {
            setEnviada(true);
            toast(`Recibimos tu consulta por ${actividad.nombre}. Te vamos a escribir para coordinar.`);
          }}
        >
          Consultar
        </button>
      )}
    </li>
  );
}

export function VerClases() {
  const [abierta, setAbierta] = useState<string | null>("pilates-reformer");
  const fijas = ACTIVIDADES.filter((a) => !a.aConsulta);
  const aConsulta = ACTIVIDADES.filter((a) => a.aConsulta);

  return (
    <div className="mt-4">
      <div className="border-t border-line">
        {fijas.map((a) => (
          <SeccionActividad
            key={a.id}
            actividad={a}
            abierta={abierta === a.id}
            onToggle={() => setAbierta(abierta === a.id ? null : a.id)}
          />
        ))}
      </div>

      <h2 className="eyebrow px-5 pb-3 pt-9">Para embarazadas</h2>
      <ul className="border-t border-line">
        {aConsulta.map((a) => (
          <ClaseAConsulta key={a.id} actividad={a} />
        ))}
      </ul>
    </div>
  );
}
