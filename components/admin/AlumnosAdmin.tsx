"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import type { Alumna } from "@/lib/data/admin";
import { useAdminAlumnas, type DatosAlta } from "./AdminAlumnasProvider";
import { AdminHeader } from "./AdminUI";
import { AlumnosLista } from "./AlumnosLista";
import { MetricasAlumnos } from "./AlumnasWidgets";
import { AltaAlumna } from "./AltaAlumna";
import { useClasesAdmin } from "./ClasesProvider";

/** Admin > Alumnos: encabezado con el botón de alta, métricas y listado. */
export function AlumnosAdmin({ alumnas }: { alumnas: Alumna[] }) {
  const toast = useToast();
  const { crearAlumna, nuevas } = useAdminAlumnas();
  const { asignarAlumna } = useClasesAdmin();
  const [alta, setAlta] = useState(false);

  const guardar = (datos: DatosAlta, claseIds: string[]) => {
    const alumna = crearAlumna(datos);
    asignarAlumna(alumna.id, claseIds);
    setAlta(false);
    toast(`Alumna creada: ${alumna.nombre} ${alumna.apellido}.`);
  };

  return (
    <main className="mx-auto max-w-[90rem] px-4 pb-16 pt-8 sm:px-8 lg:px-10 lg:pt-12">
      <AdminHeader
        titulo="Alumnos"
        subtitulo="Quiénes cursan en el estudio y cómo está su cuota."
        accion={
          <button type="button" className="btn btn-primary w-full sm:w-auto" onClick={() => setAlta(true)}>
            <Plus size={17} />
            Nueva alumna
          </button>
        }
      />

      <MetricasAlumnos />

      <div className="mt-5 lg:mt-6">
        {/* Al dar de alta, el listado vuelve a empezar (sin filtros) para que la nueva alumna se vea arriba. */}
        <AlumnosLista key={nuevas.length} alumnas={alumnas} />
      </div>

      {alta && (
        <Modal titulo="Nueva alumna" onCerrar={() => setAlta(false)} ancho="max-w-xl">
          <AltaAlumna onGuardar={guardar} onCancelar={() => setAlta(false)} />
        </Modal>
      )}
    </main>
  );
}
