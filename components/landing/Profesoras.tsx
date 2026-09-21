import { FotoPlaceholder } from "@/components/ui/FotoPlaceholder";
import { PROFESORAS } from "@/lib/data/estudio";
import { SectionTitle } from "./SectionTitle";

export function Profesoras() {
  return (
    <section id="nosotras" className="mx-auto max-w-7xl px-5 py-24 md:px-8">
      <SectionTitle
        centrado
        eyebrow="Nosotras"
        titulo={
          <>
            Quienes te <span className="italic text-sage-dark">acompañan</span>
          </>
        }
        descripcion="Un equipo de profesoras certificadas que conoce a cada alumna por su nombre."
      />
      <div className="mt-16 grid gap-12 sm:grid-cols-3">
        {PROFESORAS.map((p, i) => (
          <div key={i} className="flex flex-col items-center text-center">
            <FotoPlaceholder
              etiqueta="[FOTO]"
              tono={i === 1 ? "salvia" : i === 2 ? "topo" : "arena"}
              icono="persona"
              className="aspect-square w-48 rounded-full border-[6px] border-paper ring-1 ring-line"
            />
            <h3 className="mt-6 text-2xl text-taupe-dark">{p.nombre}</h3>
            <p className="mt-1 text-sm tracking-wide text-ink-soft">{p.especialidad}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
