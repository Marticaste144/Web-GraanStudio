"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, CreditCard, Search } from "lucide-react";
import type { Dia } from "@/lib/data/horarios";
import { useAlumno } from "./AlumnoProvider";
import { CuotaResumen } from "./CuotaResumen";
import { HoyCard } from "./HoyCard";
import { PageHeader } from "./PageHeader";

const ACCESOS = [
  { href: "/alumno/mis-clases", titulo: "Mis clases", texto: "Tu semana completa", icon: CalendarDays },
  { href: "/alumno/ver-clases", titulo: "Ver clases", texto: "Horarios y lugares", icon: Search },
  { href: "/alumno/cuota", titulo: "Mi cuota", texto: "Estado y datos de pago", icon: CreditCard },
];

interface Props {
  dia: Dia;
  etiqueta: string;
  hora: number;
  mes: string;
  vence: string;
}

/** Inicio compacto: próxima clase, clases de hoy, resumen de cuota y accesos. La semana completa está en "Mis clases". */
export function InicioVista({ dia, etiqueta, hora, mes, vence }: Props) {
  const { usuario } = useAlumno();

  return (
    <main>
      <PageHeader
        eyebrow={usuario.esNueva ? "Bienvenida a Graan Studio" : "Tu espacio"}
        titulo={
          <>
            Hola, <span className="italic text-sage-deep">{usuario.nombre}</span>
          </>
        }
        accion={
          <Link href="/alumno/ver-clases" className="btn btn-primary hidden sm:inline-flex">
            Reservar clase
          </Link>
        }
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-12 lg:gap-5">
        <div className="lg:col-span-8">
          <HoyCard dia={dia} etiqueta={etiqueta} hora={hora} />
        </div>
        <div className="lg:col-span-4">
          <CuotaResumen mes={mes} vence={vence} />
        </div>
      </div>

      <nav aria-label="Accesos rápidos" className="mt-4 lg:mt-5">
        <ul className="grid gap-3 sm:grid-cols-3 lg:gap-5">
          {ACCESOS.map(({ href, titulo, texto, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="group flex items-center gap-4 rounded-2xl border border-line bg-paper px-4 py-3.5 transition-colors hover:border-sage-deep sm:px-5"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sage-soft text-sage-deep">
                  <Icon size={19} strokeWidth={1.6} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-serif text-lg leading-tight text-taupe-dark">{titulo}</span>
                  <span className="block text-xs text-ink-soft">{texto}</span>
                </span>
                <ArrowRight size={17} className="shrink-0 text-taupe transition-transform group-hover:translate-x-1" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
