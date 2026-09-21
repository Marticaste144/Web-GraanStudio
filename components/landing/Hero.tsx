import Link from "next/link";
import { FotoPlaceholder } from "@/components/ui/FotoPlaceholder";

export function Hero() {
  return (
    <section id="inicio" className="mx-auto max-w-7xl px-5 pb-20 pt-12 md:px-8 md:pb-28 md:pt-20">
      <div className="grid items-center gap-14 md:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="eyebrow">Guillermo E. Hudson · Buenos Aires</p>
          <h1 className="mt-5 text-[2.7rem] leading-[1.05] text-taupe-dark sm:text-6xl lg:text-[4.4rem] xl:text-[5rem]">
            Pilates &amp; Yoga <span className="block italic text-sage-dark">en un solo lugar</span>
          </h1>
          <p className="mt-7 max-w-md text-base leading-relaxed text-ink-soft md:text-lg">
            Un estudio boutique para moverte con calma y con técnica. Grupos reducidos, profesoras
            certificadas y un horario propio que se vuelve tu momento de la semana.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/login?next=/alumno/ver-clases" className="btn btn-primary">
              Reservar clase
            </Link>
            <a href="#horarios" className="btn btn-outline">
              Ver horarios
            </a>
          </div>
          <p className="mt-8 text-sm text-ink-soft">
            Lunes a viernes, de 08:00 a 19:00 · Hasta 8 alumnas por clase
          </p>
        </div>

        {/* Collage editorial de fotos placeholder */}
        <div className="relative mx-auto aspect-[4/5] w-full max-w-md md:max-w-none">
          <div
            aria-hidden
            className="absolute -left-3 top-8 h-28 w-28 rounded-full border border-taupe/40 md:-left-8"
          />
          <FotoPlaceholder
            etiqueta="[FOTO DEL ESTUDIO]"
            tono="arena"
            icono="estudio"
            className="absolute right-0 top-0 h-[76%] w-[66%] rotate-[2deg] rounded-t-full"
          />
          <FotoPlaceholder
            etiqueta="[FOTO DE CLASE]"
            tono="salvia"
            icono="clase"
            className="absolute bottom-[2%] left-0 h-[42%] w-[52%] -rotate-[4deg] rounded-2xl border-[6px] border-cream"
          />
          <FotoPlaceholder
            etiqueta="[FOTO]"
            tono="topo"
            icono="detalle"
            className="absolute bottom-0 right-[4%] aspect-square w-[30%] rotate-[7deg] rounded-full border-[6px] border-cream"
          />
        </div>
      </div>
    </section>
  );
}
