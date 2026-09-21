import Link from "next/link";
import { ArrowRight, CalendarDays, CreditCard, Search } from "lucide-react";
import { HoyCard } from "@/components/alumno/HoyCard";
import { LogoMark } from "@/components/ui/Logo";
import { ALUMNA } from "@/lib/data/alumna";
import { resolverDia } from "@/lib/fechas";

const ACCESOS = [
  { href: "/alumno/mis-clases", titulo: "Mis clases", texto: "Tus horarios fijos de la semana", icon: CalendarDays },
  { href: "/alumno/ver-clases", titulo: "Ver clases", texto: "Todo lo que se dicta en el estudio", icon: Search },
  { href: "/alumno/cuota", titulo: "Mi cuota", texto: "Estado del mes y datos de pago", icon: CreditCard },
];

export default async function AlumnoInicio({
  searchParams,
}: {
  searchParams: Promise<{ dia?: string }>;
}) {
  const { dia } = await searchParams;
  const hoy = resolverDia(dia);

  return (
    <main className="px-5 pb-6 pt-6">
      <header className="flex items-center justify-between">
        <LogoMark size={38} />
        <span
          className="grid h-10 w-10 place-items-center rounded-full bg-sage-soft font-serif text-xl text-sage-dark"
          aria-hidden
        >
          {ALUMNA.nombre[0]}
        </span>
      </header>

      <h1 className="mt-8 text-5xl text-taupe-dark">
        Hola, <span className="italic text-sage-dark">{ALUMNA.nombre}</span>
      </h1>
      <p className="mt-2 text-sm text-ink-soft">Te esperamos en tus clases de esta semana.</p>

      <div className="mt-7">
        <HoyCard dia={hoy.dia} etiqueta={hoy.etiqueta} />
      </div>

      <nav aria-label="Accesos" className="mt-8">
        <ul className="border-t border-line">
          {ACCESOS.map(({ href, titulo, texto, icon: Icon }) => (
            <li key={href} className="border-b border-line">
              <Link href={href} className="group flex items-center gap-4 py-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-cream-alt text-taupe-dark">
                  <Icon size={20} strokeWidth={1.5} />
                </span>
                <span className="flex-1">
                  <span className="block font-serif text-2xl leading-none text-taupe-dark">{titulo}</span>
                  <span className="mt-1 block text-xs text-ink-soft">{texto}</span>
                </span>
                <ArrowRight
                  size={18}
                  className="text-taupe transition-transform group-hover:translate-x-1"
                />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
