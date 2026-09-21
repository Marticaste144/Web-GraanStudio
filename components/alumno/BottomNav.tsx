"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, CreditCard, Home, User } from "lucide-react";

const ITEMS = [
  { href: "/alumno", label: "Inicio", icon: Home, activo: (p: string) => p === "/alumno" },
  {
    href: "/alumno/mis-clases",
    label: "Mis clases",
    icon: CalendarDays,
    // "Ver clases" cuelga de "Mis clases"
    activo: (p: string) => p.startsWith("/alumno/mis-clases") || p.startsWith("/alumno/ver-clases"),
  },
  { href: "/alumno/cuota", label: "Mi cuota", icon: CreditCard, activo: (p: string) => p.startsWith("/alumno/cuota") },
  { href: "/alumno/perfil", label: "Perfil", icon: User, activo: (p: string) => p.startsWith("/alumno/perfil") },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navegación de alumna"
      className="fixed bottom-0 left-1/2 z-30 w-full max-w-[480px] -translate-x-1/2 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="grid grid-cols-4">
        {ITEMS.map(({ href, label, icon: Icon, activo }) => {
          const on = activo(pathname);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={on ? "page" : undefined}
                className={`flex flex-col items-center gap-1 py-3 text-[0.7rem] tracking-wide transition-colors ${
                  on ? "text-taupe-dark" : "text-ink-soft"
                }`}
              >
                <Icon size={22} strokeWidth={on ? 1.8 : 1.4} />
                <span className={on ? "font-medium" : ""}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
