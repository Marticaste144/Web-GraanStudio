"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, CreditCard, Home, Search, User, type LucideProps } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { logoutAction } from "@/lib/auth/actions";
import { useAlumno } from "./AlumnoProvider";

interface Item {
  href: string;
  label: string;
  icon: React.ComponentType<LucideProps>;
  activo: (pathname: string) => boolean;
}

const ITEMS: Item[] = [
  { href: "/alumno", label: "Inicio", icon: Home, activo: (p) => p === "/alumno" },
  { href: "/alumno/mis-clases", label: "Mis clases", icon: CalendarDays, activo: (p) => p.startsWith("/alumno/mis-clases") },
  { href: "/alumno/ver-clases", label: "Reservar", icon: Search, activo: (p) => p.startsWith("/alumno/ver-clases") },
  { href: "/alumno/cuota", label: "Mi cuota", icon: CreditCard, activo: (p) => p.startsWith("/alumno/cuota") },
  { href: "/alumno/perfil", label: "Perfil", icon: User, activo: (p) => p.startsWith("/alumno/perfil") },
];

const NAV_SUPERIOR = ITEMS.filter((i) => i.href !== "/alumno/perfil");
const PERFIL = ITEMS[4];

/**
 * Estructura del portal de alumna:
 * - Celular (< md): barra superior compacta + navegación inferior con 5 secciones.
 * - Tablet y escritorio (≥ md): barra superior con navegación y perfil; el contenido usa todo el ancho.
 */
export function AlumnoShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { usuario } = useAlumno();
  const enPerfil = PERFIL.activo(pathname);

  const salir = async () => {
    await logoutAction();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-dvh bg-cream">
      <header className="sticky top-0 z-40 border-b border-line/80 bg-cream/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[90rem] items-center gap-6 px-4 sm:px-8 md:h-[4.5rem] lg:px-12">
          <Logo size={48} nombreDesde="sm" priority />

          <nav aria-label="Portal de alumna" className="hidden flex-1 items-center justify-center gap-1 md:flex lg:gap-4">
            {NAV_SUPERIOR.map(({ href, label, activo }) => {
              const on = activo(pathname);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={on ? "page" : undefined}
                  className={`border-b-2 px-3 py-2 text-sm tracking-wide transition-colors lg:px-4 ${
                    on
                      ? "border-taupe-dark font-medium text-taupe-dark"
                      : "border-transparent text-ink-soft hover:text-taupe-dark"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-4 md:ml-0">
            <Link
              href="/alumno/perfil"
              aria-label="Mi perfil"
              aria-current={enPerfil ? "page" : undefined}
              className="group flex items-center gap-3"
            >
              <span
                className={`grid h-10 w-10 place-items-center rounded-full font-serif text-lg transition-colors ${
                  enPerfil ? "bg-taupe-dark text-cream" : "bg-sage-soft text-sage-deep group-hover:bg-sage/40"
                }`}
              >
                {usuario.nombre[0]}
              </span>
              <span className="hidden text-sm text-ink lg:block">{usuario.nombre}</span>
            </Link>
            <button
              type="button"
              onClick={salir}
              className="hidden text-xs tracking-wide text-ink-soft hover:text-taupe-dark lg:block"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[90rem] px-4 pb-28 sm:px-8 md:pb-20 lg:px-12">{children}</div>

      {/* Celular: navegación inferior */}
      <nav
        aria-label="Portal de alumna"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {ITEMS.map(({ href, label, icon: Icon, activo }) => {
            const on = activo(pathname);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={on ? "page" : undefined}
                  className={`flex flex-col items-center gap-1 px-1 py-2.5 text-[0.65rem] tracking-wide transition-colors ${
                    on ? "text-taupe-dark" : "text-ink-soft"
                  }`}
                >
                  <Icon size={21} strokeWidth={on ? 1.8 : 1.4} />
                  <span className={`whitespace-nowrap ${on ? "font-medium" : ""}`}>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
