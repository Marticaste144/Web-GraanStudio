"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CLASES_DE_ALUMNA } from "@/lib/data/alumna";
import { claveClase, type Clase, TODAS_LAS_CLASES } from "@/lib/data/horarios";

// Estado del demo, SOLO en memoria: si se recarga la página, vuelve al punto de partida.
// No se guarda en ningún lado (ni localStorage ni servidor).

interface AlumnoState {
  /** Clases a las que Sofía ya estaba anotada + las que se anote durante el demo. */
  misClases: Clase[];
  /** Cuáles se sumaron durante esta sesión del demo. */
  nuevas: Set<string>;
  enEspera: Set<string>;
  anotar: (clase: Clase) => void;
  esperar: (clase: Clase) => void;
}

const Ctx = createContext<AlumnoState | null>(null);

const iniciales = CLASES_DE_ALUMNA.flatMap((c) => {
  const clase = TODAS_LAS_CLASES.find((x) => x.dia === c.dia && x.hora === c.hora);
  return clase ? [clase] : [];
});

export function AlumnoProvider({ children }: { children: React.ReactNode }) {
  const [nuevas, setNuevas] = useState<Clase[]>([]);
  const [enEspera, setEnEspera] = useState<Set<string>>(new Set());

  const anotar = useCallback(
    (clase: Clase) =>
      setNuevas((prev) =>
        prev.some((c) => claveClase(c.dia, c.hora) === claveClase(clase.dia, clase.hora))
          ? prev
          : [...prev, clase],
      ),
    [],
  );
  const esperar = useCallback(
    (clase: Clase) => setEnEspera((prev) => new Set(prev).add(claveClase(clase.dia, clase.hora))),
    [],
  );

  const value = useMemo<AlumnoState>(
    () => ({
      misClases: [...iniciales, ...nuevas],
      nuevas: new Set(nuevas.map((c) => claveClase(c.dia, c.hora))),
      enEspera,
      anotar,
      esperar,
    }),
    [nuevas, enEspera, anotar, esperar],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAlumno() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAlumno debe usarse dentro de <AlumnoProvider>");
  return ctx;
}
