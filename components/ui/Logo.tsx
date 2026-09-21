import Image from "next/image";
import Link from "next/link";

/**
 * Logo original de Graan Studio: /public/logograan.png (no se modifica ni se recrea).
 * El PNG tiene fondo blanco opaco, así que se muestra con `mix-blend-multiply`: sobre los
 * fondos claros de la web el blanco desaparece y queda solo el monograma.
 * El nombre "GRAAN STUDIO / PILATES & YOGA" es texto vivo al lado del monograma.
 */

// Tailwind necesita las clases completas para detectarlas.
const NOMBRE_DESDE = {
  siempre: "flex",
  sm: "hidden sm:flex",
  md: "hidden md:flex",
  lg: "hidden lg:flex",
} as const;

interface LogoMarkProps {
  size?: number;
  className?: string;
  priority?: boolean;
}

/** Solo el monograma G+S. `size` es el alto en px. */
export function LogoMark({ size = 56, className = "", priority = false }: LogoMarkProps) {
  return (
    <Image
      src="/logograan.png"
      alt="Graan Studio"
      width={586}
      height={570}
      priority={priority}
      style={{ height: size, width: "auto" }}
      className={`shrink-0 mix-blend-multiply ${className}`}
    />
  );
}

interface LogoProps {
  /** "completo" = monograma + nombre. "marca" = solo el monograma. */
  variante?: "completo" | "marca";
  size?: number;
  /** Desde qué ancho de pantalla se muestra el nombre al lado del monograma. */
  nombreDesde?: keyof typeof NOMBRE_DESDE;
  href?: string;
  className?: string;
  priority?: boolean;
}

export function Logo({
  variante = "completo",
  size = 56,
  nombreDesde = "siempre",
  href = "/",
  className = "",
  priority = false,
}: LogoProps) {
  return (
    <Link href={href} className={`inline-flex items-center gap-1 ${className}`} aria-label="Graan Studio, ir al inicio">
      <LogoMark size={size} priority={priority} />
      {variante === "completo" && (
        <span className={`${NOMBRE_DESDE[nombreDesde]} flex-col whitespace-nowrap leading-none`} aria-hidden>
          <span
            className="font-serif uppercase tracking-[0.2em] text-taupe-dark"
            style={{ fontSize: Math.max(15, size * 0.32) }}
          >
            Graan Studio
          </span>
          <span
            className="mt-1.5 font-medium uppercase tracking-[0.32em] text-taupe"
            style={{ fontSize: Math.max(8, size * 0.15) }}
          >
            Pilates &amp; Yoga
          </span>
        </span>
      )}
    </Link>
  );
}
