"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { getAlumna, PRIMER_ID_ALTA_MANUAL, type Alumna, type ClasesPorSemana } from "@/lib/data/admin";
import { PLANES } from "@/lib/data/alumna";
import { mesHace } from "@/lib/fechas";

// Cambios del demo, SOLO en memoria: dar de alta o editar una alumna, o cambiar su estado, se ve en
// la ficha, el listado y las métricas mientras se navega, pero no se guarda en ningún lado
// (al recargar vuelve todo).

type Edicion = Partial<Pick<Alumna, "nombre" | "apellido" | "email" | "telefono">>;
export type AlumnaAdmin = Alumna & { activa: boolean };

/** Datos del formulario de alta. El estado no se pide: toda alumna nueva queda activa. */
export interface DatosAlta {
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  clasesPorSemana: ClasesPorSemana;
}

interface Estado {
  /** La alumna con los cambios del demo aplicados. */
  datos: (a: Alumna) => AlumnaAdmin;
  editar: (id: number, cambios: Edicion) => void;
  alternarEstado: (id: number) => void;
  /** Alumnas dadas de alta desde el Admin, la más reciente primero. */
  nuevas: Alumna[];
  crearAlumna: (datos: DatosAlta) => Alumna;
  /** Busca una alumna por id entre las de ejemplo y las dadas de alta desde el Admin. */
  buscar: (id: number) => Alumna | undefined;
  inactivas: Set<number>;
}

const Ctx = createContext<Estado | null>(null);

export function AdminAlumnasProvider({ children }: { children: React.ReactNode }) {
  const [ediciones, setEdiciones] = useState<Record<number, Edicion>>({});
  const [inactivas, setInactivas] = useState<Set<number>>(new Set());
  const [nuevas, setNuevas] = useState<Alumna[]>([]);
  const contador = useRef(PRIMER_ID_ALTA_MANUAL);

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

  /**
   * Alta manual. Queda activa (no se guarda un "estado" en el alta). Como todavía no tiene pagos,
   * su cuota del mes queda pendiente, con el importe de su plan.
   */
  const crearAlumna = useCallback((d: DatosAlta): Alumna => {
    contador.current += 1;
    const plan = PLANES[d.clasesPorSemana];
    const alumna: Alumna = {
      id: contador.current,
      nombre: d.nombre.trim(),
      apellido: d.apellido.trim(),
      email: d.email.trim(),
      telefono: d.telefono.trim(),
      clasesPorSemana: d.clasesPorSemana,
      plan: plan.nombre,
      monto: plan.monto,
      medio: "Transferencia",
      estado: "Pendiente",
      hace: 0,
      desde: mesHace(0),
      altaManual: true,
    };
    setNuevas((prev) => [alumna, ...prev]);
    return alumna;
  }, []);

  const value = useMemo<Estado>(
    () => ({
      datos: (a) => ({ ...a, ...ediciones[a.id], activa: !inactivas.has(a.id) }),
      editar,
      alternarEstado,
      nuevas,
      crearAlumna,
      buscar: (id) => getAlumna(id) ?? nuevas.find((a) => a.id === id),
      inactivas,
    }),
    [ediciones, inactivas, nuevas, editar, alternarEstado, crearAlumna],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdminAlumnas() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdminAlumnas debe usarse dentro de <AdminAlumnasProvider>");
  return ctx;
}
