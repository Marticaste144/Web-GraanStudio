"use client";

import Link from "next/link";
import { BarChart3, CalendarDays, CreditCard, LayoutDashboard, Users, type LucideProps } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useToast } from "@/components/ui/Toast";

const ITEMS: { label: string; icon: React.ComponentType<LucideProps>; href?: string }[] = [
  { label: "Inicio", icon: LayoutDashboard, href: "/admin" },
  { label: "Alumnos", icon: Users },
  { label: "Clases", icon: CalendarDays },
  { label: "Pagos", icon: CreditCard },
  { label: "Métricas", icon: BarChart3 },
];

export function AdminSidebar() {
  const toast = useToast();

  const item = (it: (typeof ITEMS)[number], compacto: boolean) => {
    const Icon = it.icon;
    const activo = Boolean(it.href);
    const clases = `flex items-center gap-3 rounded-full text-sm transition-colors ${
      compacto ? "shrink-0 px-4 py-2.5" : "px-5 py-3"
    } ${activo ? "bg-taupe-dark text-cream" : "text-ink-soft hover:bg-cream-alt hover:text-taupe-dark"}`;
    const contenido = (
      <>
        <Icon size={18} strokeWidth={1.5} />
        {it.label}
      </>
    );
    return activo ? (
      <Link key={it.label} href={it.href!} className={clases} aria-current="page">
        {contenido}
      </Link>
    ) : (
      <button
        key={it.label}
        className={`${clases} ${compacto ? "" : "w-full text-left"}`}
        onClick={() => toast("Esta sección se incluye en la versión completa.")}
      >
        {contenido}
      </button>
    );
  };

  return (
    <>
      {/* Escritorio: barra lateral */}
      <aside className="fixed inset-y-0 left-0 hidden w-72 flex-col border-r border-line bg-paper px-5 py-7 lg:flex">
        <Logo size={56} priority />
        <p className="eyebrow mb-3 mt-10 px-5">Administración</p>
        <nav aria-label="Administración" className="flex flex-col gap-1">
          {ITEMS.map((it) => item(it, false))}
        </nav>
        <Link href="/" className="mt-auto px-5 text-xs text-ink-soft hover:text-taupe-dark">
          ← Volver al sitio
        </Link>
      </aside>

      {/* Celular / tablet: barra superior */}
      <div className="border-b border-line bg-paper px-4 py-3 sm:px-8 lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <Logo size={48} priority />
          <Link href="/" className="text-xs text-ink-soft hover:text-taupe-dark">
            ← Sitio
          </Link>
        </div>
        <nav aria-label="Administración" className="no-scrollbar -mx-4 mt-3 flex gap-1 overflow-x-auto px-4 sm:-mx-8 sm:px-8">
          {ITEMS.map((it) => item(it, true))}
        </nav>
      </div>
    </>
  );
}
