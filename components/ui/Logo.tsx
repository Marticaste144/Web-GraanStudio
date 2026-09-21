import Link from "next/link";

/**
 * LOGO PROVISORIO — aproximación tipográfica.
 *
 * Para usar el logo real: copiá el archivo a /public (ej. public/logo.svg) y reemplazá el
 * contenido de <LogoMark /> por:
 *   <Image src="/logo.svg" alt="Graan Studio" width={size} height={size} />
 * Todo el sitio usa este componente, así que alcanza con cambiarlo acá.
 */

export function LogoMark({ size = 44 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label="Graan Studio"
      className="shrink-0"
    >
      <circle cx="50" cy="50" r="48.5" fill="none" stroke="#7A6A58" strokeWidth="1.2" />
      <text
        x="38"
        y="68"
        textAnchor="middle"
        fontSize="76"
        fontWeight="500"
        fill="#7A6A58"
        style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
      >
        G
      </text>
      <text
        x="63"
        y="76"
        textAnchor="middle"
        fontSize="76"
        fontWeight="500"
        fontStyle="italic"
        fill="#6E8A7E"
        fillOpacity="0.9"
        style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
      >
        S
      </text>
    </svg>
  );
}

interface LogoProps {
  /** "completo" = marca + nombre. "marca" = solo el círculo. */
  variante?: "completo" | "marca";
  size?: number;
  href?: string;
  className?: string;
}

export function Logo({ variante = "completo", size = 44, href = "/", className = "" }: LogoProps) {
  return (
    <Link href={href} className={`inline-flex items-center gap-3 ${className}`} aria-label="Graan Studio">
      <LogoMark size={size} />
      {variante === "completo" && (
        <span className="flex flex-col whitespace-nowrap leading-none">
          <span
            className="font-serif font-medium uppercase tracking-[0.18em] text-taupe-dark"
            style={{ fontSize: size * 0.5 }}
          >
            Graan Studio
          </span>
          <span
            className="mt-1.5 font-medium uppercase tracking-[0.3em] text-taupe"
            style={{ fontSize: Math.max(9, size * 0.15) }}
          >
            Pilates &amp; Yoga
          </span>
        </span>
      )}
    </Link>
  );
}
