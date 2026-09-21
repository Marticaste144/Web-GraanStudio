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
      <div className="mx-auto flex h-[4.75rem] max-w-7xl items-center justify-between px-5 md:px-8">
        <Logo size={56} priority />

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

        <div className="flex items-center gap-2 md:gap-5">
          <Link href="/login" className="hidden text-sm tracking-wide text-taupe-dark hover:underline hover:underline-offset-4 md:inline">
            Iniciar sesión
          </Link>
          <Link href="/registro" className="btn btn-primary btn-sm hidden sm:inline-flex">
            Crear cuenta
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
              className="block border-b border-line/60 py-3.5 font-serif text-xl text-taupe-dark"
            >
              {n.label}
            </a>
          ))}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Link href="/login" className="btn btn-outline">
              Iniciar sesión
            </Link>
            <Link href="/registro" className="btn btn-primary">
              Crear cuenta
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
