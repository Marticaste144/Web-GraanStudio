import { MapPin } from "lucide-react";
import { direccionCompleta, ESTUDIO } from "@/lib/data/estudio";
import { SectionTitle } from "./SectionTitle";

function MapaPlaceholder() {
  return (
    <div
      role="img"
      aria-label="[MAPA]"
      className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-line bg-cream-alt"
    >
      <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <g stroke="#fbf9f4" strokeWidth="14" strokeLinecap="round" fill="none">
          <path d="M-10 90 L410 60" />
          <path d="M-10 210 L410 240" />
          <path d="M120 -10 L150 310" />
          <path d="M290 -10 L260 310" />
        </g>
        <g stroke="#fbf9f4" strokeWidth="6" strokeLinecap="round" fill="none">
          <path d="M-10 150 L410 140" />
          <path d="M210 -10 L205 310" />
        </g>
        <rect x="165" y="100" width="80" height="34" rx="3" fill="#dde7e1" />
        <rect x="20" y="160" width="80" height="40" rx="3" fill="#dde7e1" />
      </svg>
      <div className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 text-taupe-dark">
        <MapPin size={44} strokeWidth={1.4} fill="#f7f3ec" />
      </div>
      <span className="absolute bottom-3 left-4 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-taupe">
        [MAPA]
      </span>
    </div>
  );
}

export function Ubicacion() {
  const { direccion } = ESTUDIO;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccionCompleta())}`;

  return (
    <section id="ubicacion" className="bg-cream-alt">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-24 md:grid-cols-2 md:px-8">
        <div>
          <SectionTitle
            eyebrow="Ubicación"
            titulo={
              <>
                Encontranos en <span className="italic text-sage-dark">Hudson</span>
              </>
            }
          />
          <address className="mt-8 not-italic">
            <p className="font-serif text-3xl text-taupe-dark">{direccion.lugar}</p>
            <p className="mt-2 text-lg text-ink">{direccion.detalle}</p>
            <p className="text-lg text-ink-soft">{direccion.zona}</p>
          </address>
          <p className="mt-6 text-sm text-ink-soft">Lunes a viernes, de 08:00 a 19:00</p>
          <a href={mapsUrl} target="_blank" rel="noreferrer" className="btn btn-outline mt-8">
            Cómo llegar
          </a>
        </div>
        <MapaPlaceholder />
      </div>
    </section>
  );
}
