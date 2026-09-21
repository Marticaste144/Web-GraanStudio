import { ActividadIcon } from "@/components/ui/ActividadIcon";
import { ACTIVIDADES } from "@/lib/data/actividades";
import { SectionTitle } from "./SectionTitle";

export function Clases() {
  return (
    <section id="clases" className="bg-cream-alt">
      <div className="mx-auto max-w-7xl px-5 py-24 md:px-8">
        <SectionTitle
          eyebrow="Nuestras clases"
          titulo={
            <>
              Ocho formas de <span className="italic text-sage-deep">moverte</span>
            </>
          }
          descripcion="Elegís tus días y horarios, y venís a la misma clase cada semana, con tu grupo y tu profesora."
        />
        <ol className="mt-14 grid gap-x-12 sm:grid-cols-2">
          {ACTIVIDADES.map((a, i) => (
            <li key={a.id} className="flex gap-5 border-t border-taupe/25 py-7">
              <span className="w-8 shrink-0 pt-1 font-serif text-lg italic text-taupe">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-[1.7rem] text-taupe-dark">{a.nombre}</h3>
                  <ActividadIcon icono={a.icono} size={24} className="shrink-0 text-sage-deep" />
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{a.descripcion}</p>
                {a.aConsulta && (
                  <p className="mt-3 text-xs font-medium uppercase tracking-[0.15em] text-sage-deep">
                    Se coordina a consulta
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
