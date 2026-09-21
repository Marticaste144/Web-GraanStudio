"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const NAV = [
  { href: "#inicio", label: "Inicio" },
  { href: "#clases", label: "Clases" },
  { href: "#nosotras", label: "Nosotras" },
  { href: "#ubicacion", label: "Ubicación" },
];

export function Header() {
  const [abierto, setAbierto] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between px-5 md:px-8">
        <Logo size={40} />

        <nav className="hidden items-center gap-9 md:flex" aria-label="Principal">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="text-sm tracking-wide text-ink-soft transition-colors hover:text-taupe-dark"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/alumno/ver-clases" className="btn btn-primary btn-sm hidden sm:inline-flex">
            Reservar clase
          </Link>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full text-taupe-dark md:hidden"
            aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={abierto}
            onClick={() => setAbierto((v) => !v)}
          >
            {abierto ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {abierto && (
        <nav className="border-t border-line bg-cream px-5 pb-5 pt-2 md:hidden" aria-label="Móvil">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              onClick={() => setAbierto(false)}
              className="block border-b border-line/60 py-3.5 font-serif text-2xl text-taupe-dark"
            >
              {n.label}
            </a>
          ))}
          <Link href="/alumno/ver-clases" className="btn btn-primary mt-5 w-full">
            Reservar clase
          </Link>
        </nav>
      )}
    </header>
  );
}
