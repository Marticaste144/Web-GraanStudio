import { Camera, Dumbbell, Flower2, Home, Sparkles, type LucideProps } from "lucide-react";

export type TonoFoto = "arena" | "salvia" | "topo";
export type IconoFoto = "estudio" | "clase" | "equipamiento" | "detalle" | "persona";

const TONOS: Record<TonoFoto, string> = {
  arena: "bg-cream-alt text-taupe",
  salvia: "bg-sage text-white",
  topo: "bg-taupe text-cream",
};

const ICONOS: Record<IconoFoto, React.ComponentType<LucideProps>> = {
  estudio: Home,
  clase: Flower2,
  equipamiento: Dumbbell,
  detalle: Sparkles,
  persona: Camera,
};

interface Props {
  etiqueta: string;
  tono?: TonoFoto;
  icono?: IconoFoto;
  /** Cuando haya foto real, pasá la ruta (ej. "/fotos/estudio.jpg") y reemplaza al placeholder. */
  src?: string;
  className?: string;
}

/** Bloque que hace de foto mientras no hay imágenes reales. */
export function FotoPlaceholder({
  etiqueta,
  tono = "arena",
  icono = "persona",
  src,
  className = "",
}: Props) {
  const Icon = ICONOS[icono];
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={etiqueta} className={`object-cover ${className}`} />;
  }
  return (
    <div
      role="img"
      aria-label={etiqueta}
      className={`foto-textura flex flex-col items-center justify-center gap-2 overflow-hidden ${TONOS[tono]} ${className}`}
    >
      <Icon size={28} strokeWidth={1.2} className="opacity-80" />
      <span className="px-3 text-center text-[0.65rem] font-medium uppercase tracking-[0.2em] opacity-80">
        {etiqueta}
      </span>
    </div>
  );
}
