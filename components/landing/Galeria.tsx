import { FotoPlaceholder } from "@/components/ui/FotoPlaceholder";
import { GALERIA } from "@/lib/data/estudio";
import { SectionTitle } from "./SectionTitle";

// Distribución asimétrica (desktop): cada foto con su propia proporción.
const LAYOUT = [
  "md:col-span-5 md:row-span-2 aspect-[4/5] md:aspect-auto",
  "md:col-span-7 aspect-[16/10] md:aspect-auto",
  "md:col-span-4 aspect-square md:aspect-auto",
  "md:col-span-3 aspect-square md:aspect-auto",
];

export function Galeria() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 md:px-8">
      <SectionTitle
        eyebrow="Galería"
        titulo={
          <>
            Momentos en <span className="italic text-sage-deep">Graan Studio</span>
          </>
        }
      />
      <div className="mt-14 grid gap-4 md:h-[34rem] md:grid-cols-12 md:grid-rows-2">
        {GALERIA.map((g, i) => (
          <FotoPlaceholder
            key={i}
            etiqueta={g.etiqueta}
            tono={g.tono}
            icono={g.icono}
            className={`w-full ${i === 0 ? "rounded-t-[999px]" : "rounded-2xl"} ${LAYOUT[i]}`}
          />
        ))}
      </div>
    </section>
  );
}
