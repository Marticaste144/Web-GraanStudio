"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Alumna } from "@/lib/data/admin";

// Cambios del demo, SOLO en memoria: editar datos o cambiar el estado de una alumna se ve en la
// ficha y en el listado mientras se navega, pero no se guarda en ningún lado (al recargar vuelve todo).

type Edicion = Partial<Pick<Alumna, "nombre" | "apellido" | "email" | "telefono">>;
export type AlumnaAdmin = Alumna & { activa: boolean };

interface Estado {
  /** La alumna con los cambios del demo aplicados. */
  datos: (a: Alumna) => AlumnaAdmin;
  editar: (id: number, cambios: Edicion) => void;
  alternarEstado: (id: number) => void;
  cantidadInactivas: number;
}

const Ctx = createContext<Estado | null>(null);

export function AdminAlumnasProvider({ children }: { children: React.ReactNode }) {
  const [ediciones, setEdiciones] = useState<Record<number, Edicion>>({});
  const [inactivas, setInactivas] = useState<Set<number>>(new Set());

  const editar = useCallback(
    (id: number, cambios: Edicion) => setEdiciones((prev) => ({ ...prev, [id]: { ...prev[id], ...cambios } })),
    [],
  );

  const alternarEstado = useCallback(
    (id: number) =>
      setInactivas((prev) => {
        const sig = new Set(prev);
        if (sig.has(id)) sig.delete(id);
        else sig.add(id);
        return sig;
      }),
    [],
  );

  const value = useMemo<Estado>(
    () => ({
      datos: (a) => ({ ...a, ...ediciones[a.id], activa: !inactivas.has(a.id) }),
      editar,
      alternarEstado,
      cantidadInactivas: inactivas.size,
    }),
    [ediciones, inactivas, editar, alternarEstado],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdminAlumnas() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdminAlumnas debe usarse dentro de <AdminAlumnasProvider>");
  return ctx;
}
