"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { ALUMNA_DEMO, CLASES_DE_ALUMNA, planPorCantidad, type Plan, type Usuario } from "@/lib/data/alumna";
import { claveClase, type Clase, TODAS_LAS_CLASES } from "@/lib/data/horarios";

// Estado del demo, SOLO en memoria: si se recarga la página, vuelve al punto de partida
// (Sofía con sus 3 clases). No se guarda en ningún lado (ni localStorage ni servidor).
// El proveedor vive en el layout raíz, así la sesión sobrevive a la navegación entre
// Landing → Login → Portal de alumna.

const CLASES_INICIALES_DE_SOFIA = CLASES_DE_ALUMNA.flatMap((c) => {
  const clase = TODAS_LAS_CLASES.find((x) => x.dia === c.dia && x.hora === c.hora);
  return clase ? [clase] : [];
});

interface AlumnoState {
  usuario: Usuario;
  /** Todas las clases actuales: las que ya tenía + las que se anotó durante el demo. */
  misClases: Clase[];
  /** Horarios que ya tenía antes de usar el demo (no se vuelven a ofrecer). */
  yaTenia: Set<string>;
  /** Horarios a los que se anotó durante el demo. */
  anotadasAhora: Set<string>;
  enEspera: Set<string>;
  plan: Plan | null;
  comprobante: string | null;
  anotar: (clase: Clase) => void;
  esperar: (clase: Clase) => void;
  cargarComprobante: (nombreArchivo: string) => void;
  iniciarSesion: () => void;
  crearCuenta: (datos: Pick<Usuario, "nombre" | "apellido" | "email" | "telefono">) => void;
}

const Ctx = createContext<AlumnoState | null>(null);

export function AlumnoProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario>(ALUMNA_DEMO);
  const [base, setBase] = useState<Clase[]>(CLASES_INICIALES_DE_SOFIA);
  const [agregadas, setAgregadas] = useState<Clase[]>([]);
  const [enEspera, setEnEspera] = useState<Set<string>>(new Set());
  const [comprobante, setComprobante] = useState<string | null>(null);

  const reiniciar = useCallback((u: Usuario, clases: Clase[]) => {
    setUsuario(u);
    setBase(clases);
    setAgregadas([]);
    setEnEspera(new Set());
    setComprobante(null);
  }, []);

  const iniciarSesion = useCallback(() => reiniciar(ALUMNA_DEMO, CLASES_INICIALES_DE_SOFIA), [reiniciar]);

  const crearCuenta = useCallback<AlumnoState["crearCuenta"]>(
    (datos) => reiniciar({ ...datos, desde: "Hoy", esNueva: true }, []),
    [reiniciar],
  );

  const anotar = useCallback(
    (clase: Clase) =>
      setAgregadas((prev) =>
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

  const value = useMemo<AlumnoState>(() => {
    const misClases = [...base, ...agregadas];
    return {
      usuario,
      misClases,
      yaTenia: new Set(base.map((c) => claveClase(c.dia, c.hora))),
      anotadasAhora: new Set(agregadas.map((c) => claveClase(c.dia, c.hora))),
      enEspera,
      plan: planPorCantidad(misClases.length),
      comprobante,
      anotar,
      esperar,
      cargarComprobante: setComprobante,
      iniciarSesion,
      crearCuenta,
    };
  }, [usuario, base, agregadas, enEspera, comprobante, anotar, esperar, iniciarSesion, crearCuenta]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAlumno() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAlumno debe usarse dentro de <AlumnoProvider>");
  return ctx;
}
