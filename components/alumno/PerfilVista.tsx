"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { useAlumno } from "./AlumnoProvider";
import { PageHeader } from "./PageHeader";

export function PerfilVista() {
  const { usuario, plan, misClases } = useAlumno();

  const datos = [
    { label: "Email", valor: usuario.email || "—" },
    { label: "Teléfono", valor: usuario.telefono || "—" },
    { label: "Plan", valor: plan ? plan.nombre : "Sin clases todavía" },
    { label: "Clases", valor: String(misClases.length) },
    { label: "Alumna desde", valor: usuario.desde },
  ];

  return (
    <main>
      <PageHeader eyebrow="Perfil" titulo="Tus datos" />

      <div className="mt-8 grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)] lg:gap-8">
        <section className="flex flex-col items-center rounded-3xl bg-taupe-dark p-8 text-center text-cream sm:p-10">
          <span
            className="grid h-24 w-24 place-items-center rounded-full bg-cream font-serif text-5xl text-taupe-dark"
            aria-hidden
          >
            {usuario.nombre[0]}
          </span>
          <p className="mt-6 font-serif text-3xl leading-tight">
            {usuario.nombre} {usuario.apellido}
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-sage">Alumna</p>
          <Link href="/" className="btn mt-8 w-full border border-cream/40 text-cream hover:bg-cream hover:text-taupe-dark">
            <LogOut size={16} />
            Cerrar sesión
          </Link>
        </section>

        <section className="rounded-3xl border border-line bg-paper p-6 sm:p-8">
          <h2 className="text-2xl text-taupe-dark sm:text-3xl">Información personal</h2>
          <dl className="mt-5 divide-y divide-line border-y border-line">
            {datos.map((d) => (
              <div key={d.label} className="flex items-baseline justify-between gap-6 py-4">
                <dt className="shrink-0 text-[0.7rem] uppercase tracking-[0.15em] text-ink-soft">{d.label}</dt>
                <dd className="min-w-0 break-words text-right text-sm text-ink">{d.valor}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </main>
  );
}
