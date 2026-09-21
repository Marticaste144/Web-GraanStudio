import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { EstadoPago } from "@/lib/data/admin";

/** Encabezado de cada pantalla del admin. */
export function AdminHeader({
  eyebrow = "Panel de administración",
  titulo,
  subtitulo,
  accion,
}: {
  eyebrow?: string;
  titulo: React.ReactNode;
  subtitulo?: string;
  accion?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
      <div className="min-w-0">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 text-[2.2rem] leading-[1.08] text-taupe-dark md:text-5xl lg:text-[3.2rem]">{titulo}</h1>
        {subtitulo && <p className="mt-3 text-sm text-ink-soft md:text-base">{subtitulo}</p>}
      </div>
      {accion}
    </header>
  );
}

/** Tarjeta con título. `tono` varía el fondo para dar jerarquía. */
export function Tarjeta({
  titulo,
  subtitulo,
  enlace,
  tono = "paper",
  children,
  className = "",
}: {
  titulo: string;
  subtitulo?: string;
  enlace?: { href: string; texto: string };
  tono?: "paper" | "sage" | "cream";
  children: React.ReactNode;
  className?: string;
}) {
  const fondo =
    tono === "sage"
      ? "border-sage/40 bg-sage-mist"
      : tono === "cream"
        ? "border-line bg-cream-alt/70"
        : "border-line bg-paper";
  return (
    <section className={`min-w-0 rounded-3xl border p-5 sm:p-7 ${fondo} ${className}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div>
          <h2 className="text-2xl text-taupe-dark sm:text-[1.7rem]">{titulo}</h2>
          {subtitulo && <p className="mt-1 text-sm text-ink-soft">{subtitulo}</p>}
        </div>
        {enlace && (
          <Link
            href={enlace.href}
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-sage-deep hover:text-taupe-dark"
          >
            {enlace.texto}
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

const TONOS_METRICA = {
  paper: "border border-line bg-paper text-taupe-dark",
  oscura: "bg-taupe-dark text-cream",
  sage: "border border-sage/40 bg-sage-soft text-taupe-dark",
} as const;

/**
 * Métrica con el valor SIEMPRE completo: el tamaño de la tipografía se adapta al ancho de la
 * tarjeta (unidades de contenedor), así nunca se corta, se trunca ni se desborda.
 */
export function Metrica({
  etiqueta,
  valor,
  nota,
  tono = "paper",
}: {
  etiqueta: string;
  valor: string;
  nota: string;
  tono?: keyof typeof TONOS_METRICA;
}) {
  const oscura = tono === "oscura";
  return (
    <div className={`min-w-0 rounded-3xl p-5 sm:p-6 ${TONOS_METRICA[tono]}`}>
      <p className={`eyebrow ${oscura ? "!text-sage" : ""}`}>{etiqueta}</p>
      <div style={{ containerType: "inline-size" }} className="mt-4">
        <p
          className="whitespace-nowrap font-serif leading-[1.1] tabular-nums"
          style={{ fontSize: "clamp(1.6rem, 15cqw, 2.9rem)" }}
        >
          {valor}
        </p>
      </div>
      <p className={`mt-2 text-xs ${oscura ? "text-cream/75" : "text-ink-soft"}`}>{nota}</p>
    </div>
  );
}

export function EstadoBadge({ estado }: { estado: EstadoPago }) {
  return estado === "Aprobado" ? (
    <span className="inline-block whitespace-nowrap rounded-full bg-sage-soft px-3 py-1 text-xs font-medium text-sage-deep">
      Aprobado
    </span>
  ) : (
    <span className="inline-block whitespace-nowrap rounded-full bg-amber-soft px-3 py-1 text-xs font-medium text-amber-ink">
      Pendiente
    </span>
  );
}

/** Barra de progreso con etiqueta y valor a la derecha. */
export function Barra({
  etiqueta,
  valor,
  porcentaje,
  color = "sage",
}: {
  etiqueta: string;
  valor: string;
  /** 0–100 */
  porcentaje: number;
  color?: "sage" | "taupe";
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4 text-sm">
        <span className="min-w-0">{etiqueta}</span>
        <span className="shrink-0 font-medium tabular-nums text-taupe-dark">{valor}</span>
      </div>
      <div
        className="mt-2 h-2.5 overflow-hidden rounded-full bg-cream-alt"
        role="progressbar"
        aria-valuenow={Math.round(porcentaje)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={etiqueta}
      >
        <div
          className={`h-full rounded-full ${color === "sage" ? "bg-sage-deep" : "bg-taupe"}`}
          style={{ width: `${Math.min(100, Math.max(0, porcentaje))}%` }}
        />
      </div>
    </div>
  );
}
