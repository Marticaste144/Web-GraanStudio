"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, CreditCard, Search } from "lucide-react";
import type { Dia } from "@/lib/data/horarios";
import { useAlumno } from "./AlumnoProvider";
import { CuotaResumen } from "./CuotaResumen";
import { HoyCard } from "./HoyCard";
import { PageHeader } from "./PageHeader";
import { SemanaAlumna } from "./SemanaAlumna";

const ACCESOS = [
  { href: "/alumno/mis-clases", titulo: "Mis clases", texto: "Tus clases semanales", icon: CalendarDays },
  { href: "/alumno/ver-clases", titulo: "Ver clases", texto: "Horarios y lugares disponibles", icon: Search },
  { href: "/alumno/cuota", titulo: "Mi cuota", texto: "Estado del mes y datos de pago", icon: CreditCard },
];

interface Props {
  dia: Dia;
  etiqueta: string;
  mes: string;
  vence: string;
}

export function InicioVista({ dia, etiqueta, mes, vence }: Props) {
  const { usuario } = useAlumno();

  return (
    <main>
      <PageHeader
        eyebrow={usuario.esNueva ? "Bienvenida a Graan Studio" : "Tu espacio"}
        titulo={
          <>
            Hola, <span className="italic text-sage-dark">{usuario.nombre}</span>
          </>
        }
        accion={
          <Link href="/alumno/ver-clases" className="btn btn-primary hidden sm:inline-flex">
            Reservar clase
          </Link>
        }
      />

      {/* Grilla: 1 columna en celular · 2 en tablet · 12 en escritorio */}
      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-12 lg:gap-6">
        <div className="md:col-span-2 lg:col-span-8 lg:col-start-1 lg:row-start-1">
          <HoyCard dia={dia} etiqueta={etiqueta} />
        </div>
        <div className="lg:col-span-4 lg:col-start-9 lg:row-start-1">
          <CuotaResumen mes={mes} vence={vence} />
        </div>
        <nav
          aria-label="Accesos"
          className="rounded-3xl border border-line bg-paper px-6 py-2 max-md:order-4 sm:px-8 lg:col-span-4 lg:col-start-9 lg:row-start-2"
        >
          <ul className="divide-y divide-line">
            {ACCESOS.map(({ href, titulo, texto, icon: Icon }) => (
              <li key={href}>
                <Link href={href} className="group flex items-center gap-4 py-5">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-cream-alt text-taupe-dark">
                    <Icon size={20} strokeWidth={1.5} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-serif text-xl leading-tight text-taupe-dark">{titulo}</span>
                    <span className="mt-1 block text-xs text-ink-soft">{texto}</span>
                  </span>
                  <ArrowRight size={18} className="shrink-0 text-taupe transition-transform group-hover:translate-x-1" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="max-md:order-3 md:col-span-2 lg:col-span-8 lg:col-start-1 lg:row-start-2">
          <SemanaAlumna hoy={dia} />
        </div>
      </div>
    </main>
  );
}
