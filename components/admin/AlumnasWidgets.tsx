"use client";

// Métricas que dependen de las alumnas: se actualizan cuando se da de alta una alumna
// o se cambia su estado (activa / inactiva).

import { ALUMNAS, type Alumna } from "@/lib/data/admin";
import { useAdminAlumnas } from "./AdminAlumnasProvider";
import { Metrica } from "./AdminUI";

/** Todas las alumnas (las nuevas y las de ejemplo) que están activas. */
function useActivas(): Alumna[] {
  const { nuevas, inactivas } = useAdminAlumnas();
  return [...nuevas, ...ALUMNAS].filter((a) => !inactivas.has(a.id));
}

export function MetricaAlumnasActivas() {
  return <Metrica etiqueta="Alumnas activas" valor={String(useActivas().length)} nota="con al menos una clase semanal" />;
}

export function MetricasAlumnos() {
  const activas = useActivas();
  const pendientes = activas.filter((a) => a.estado === "Pendiente").length;
  const tres = activas.filter((a) => a.clasesPorSemana === 3).length;
  return (
    <div className="mt-8 grid gap-4 min-[560px]:grid-cols-3 lg:gap-5">
      <Metrica etiqueta="Alumnas activas" valor={String(activas.length)} nota="con al menos una clase semanal" />
      <Metrica etiqueta="Cuota pendiente" valor={String(pendientes)} nota="alumnas por regularizar" tono="sage" />
      <Metrica etiqueta="Plan de 3 clases" valor={String(tres)} nota="alumnas con el plan más completo" />
    </div>
  );
}
