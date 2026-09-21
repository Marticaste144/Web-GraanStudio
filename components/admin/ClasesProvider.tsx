"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { crearClasesIniciales, HORAS_DISPONIBLES, type ClaseAdmin, type DatosClase } from "@/lib/data/clasesAdmin";
import { nombreDia } from "@/lib/data/horarios";

// Gestión básica de clases, SOLO en memoria: crear, editar y eliminar se ven en todo el Admin
// mientras se navega, pero no se guardan (al recargar vuelve a la grilla original).

export type Resultado = { ok: true; id: string } | { ok: false; error: string };

interface Estado {
  clases: ClaseAdmin[];
  crear: (datos: DatosClase) => Resultado;
  editar: (id: string, datos: DatosClase) => Resultado;
  eliminar: (id: string) => void;
}

const Ctx = createContext<Estado | null>(null);

export function ClasesProvider({ children }: { children: React.ReactNode }) {
  const [clases, setClases] = useState<ClaseAdmin[]>(() => crearClasesIniciales());
  const ultimas = useRef(clases);
  ultimas.current = clases;
  const contador = useRef(1000);

  /** Controles mínimos de integridad: la grilla admite una sola clase por día y hora, y el cupo no puede quedar por debajo de las alumnas ya anotadas. */
  const validar = useCallback((datos: DatosClase, idActual?: string): string | null => {
    if (!datos.profesora.trim()) return "Completá el nombre del/de la profesor/a.";
    if (!HORAS_DISPONIBLES.includes(datos.hora)) return "Elegí un horario.";
    if (!Number.isInteger(datos.cupo) || datos.cupo < 1) return "El cupo máximo tiene que ser un número de 1 o más.";
    if (ultimas.current.some((c) => c.id !== idActual && c.dia === datos.dia && c.hora === datos.hora)) {
      return `Ya hay una clase el ${nombreDia(datos.dia)} a las ${datos.hora}. Elegí otro día u horario.`;
    }
    const actual = ultimas.current.find((c) => c.id === idActual);
    if (actual && datos.cupo < actual.alumnas.length) {
      return `El cupo no puede ser menor a las alumnas ya anotadas (${actual.alumnas.length}).`;
    }
    return null;
  }, []);

  const crear = useCallback<Estado["crear"]>(
    (datos) => {
      const error = validar(datos);
      if (error) return { ok: false, error };
      const id = `clase-${++contador.current}`;
      setClases((prev) => [...prev, { id, ...datos, profesora: datos.profesora.trim(), alumnas: [] }]);
      return { ok: true, id };
    },
    [validar],
  );

  const editar = useCallback<Estado["editar"]>(
    (id, datos) => {
      const error = validar(datos, id);
      if (error) return { ok: false, error };
      setClases((prev) => prev.map((c) => (c.id === id ? { ...c, ...datos, profesora: datos.profesora.trim() } : c)));
      return { ok: true, id };
    },
    [validar],
  );

  const eliminar = useCallback((id: string) => setClases((prev) => prev.filter((c) => c.id !== id)), []);

  const value = useMemo<Estado>(() => ({ clases, crear, editar, eliminar }), [clases, crear, editar, eliminar]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useClasesAdmin() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useClasesAdmin debe usarse dentro de <ClasesProvider>");
  return ctx;
}
