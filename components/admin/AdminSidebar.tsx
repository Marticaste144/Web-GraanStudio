"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, CalendarDays, CreditCard, LayoutDashboard, LogOut, Tag, Users, type LucideProps } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useAdminSession } from "@/components/admin/AdminSessionProvider";
import { logoutAction } from "@/lib/auth/actions";

interface ItemNav {
  label: string;
  icon: React.ComponentType<LucideProps>;
  href: string;
  /** Si no está definido, el link es visible para cualquier rol admitido en /admin. */
  soloOwner?: boolean;
}

const ITEMS: ItemNav[] = [
  { label: "Inicio", icon: LayoutDashboard, href: "/admin" },
  { label: "Alumnos", icon: Users, href: "/admin/alumnos" },
  { label: "Clases", icon: CalendarDays, href: "/admin/clases" },
  { label: "Pagos", icon: CreditCard, href: "/admin/pagos" },
  { label: "Precios", icon: Tag, href: "/admin/precios", soloOwner: true },
  { label: "Métricas", icon: BarChart3, href: "/admin/metricas", soloOwner: true },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { role } = useAdminSession();
  const items = ITEMS.filter((it) => !it.soloOwner || role === "OWNER");
  const esActivo = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const salir = async () => {
    await logoutAction();
    router.push("/admin/login");
    router.refresh();
  };

  const item = (it: ItemNav, compacto: boolean) => {
    const Icon = it.icon;
    const on = esActivo(it.href);
    return (
      <Link
        key={it.href}
        href={it.href}
        aria-current={on ? "page" : undefined}
        className={`flex items-center gap-3 rounded-full text-sm transition-colors ${
          compacto ? "px-3.5 py-2" : "px-5 py-3"
        } ${on ? "bg-taupe-dark text-cream" : "text-ink-soft hover:bg-cream-alt hover:text-taupe-dark"}`}
      >
        <Icon size={18} strokeWidth={1.5} />
        {it.label}
      </Link>
    );
  };

  return (
    <>
      {/* Escritorio: barra lateral */}
      <aside className="fixed inset-y-0 left-0 hidden w-72 flex-col border-r border-line bg-paper px-5 py-7 lg:flex">
        <Logo size={56} priority />
        <p className="eyebrow mb-3 mt-10 px-5">Administración</p>
        <nav aria-label="Administración" className="flex flex-col gap-1">
          {items.map((it) => item(it, false))}
        </nav>
        <div className="mt-auto flex flex-col gap-3 px-5">
          <button
            type="button"
            onClick={salir}
            className="flex items-center gap-2 text-xs text-ink-soft hover:text-taupe-dark"
          >
            <LogOut size={14} />
            Cerrar sesión
          </button>
          <Link href="/" className="text-xs text-ink-soft hover:text-taupe-dark">
            ← Volver al sitio
          </Link>
        </div>
      </aside>

      {/* Celular / tablet: barra superior */}
      <div className="border-b border-line bg-paper px-4 py-3 sm:px-8 lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <Logo size={48} priority />
          <div className="flex items-center gap-4">
            <button type="button" onClick={salir} className="text-xs text-ink-soft hover:text-taupe-dark">
              Salir
            </button>
            <Link href="/" className="text-xs text-ink-soft hover:text-taupe-dark">
              ← Sitio
            </Link>
          </div>
        </div>
        <nav aria-label="Administración" className="mt-3 flex flex-wrap gap-1.5">
          {items.map((it) => item(it, true))}
        </nav>
      </div>
    </>
  );
}
