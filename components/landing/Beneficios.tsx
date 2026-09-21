import { Award, Dumbbell, Sparkles, Users, type LucideProps } from "lucide-react";
import { BENEFICIOS } from "@/lib/data/estudio";

const ICONOS: Record<(typeof BENEFICIOS)[number]["icono"], React.ComponentType<LucideProps>> = {
  certificado: Award,
  equipamiento: Dumbbell,
  grupos: Users,
  ambiente: Sparkles,
};

export function Beneficios() {
  return (
    <section className="border-y border-line bg-paper">
      <div className="mx-auto grid max-w-7xl gap-x-10 gap-y-12 px-5 py-16 sm:grid-cols-2 md:px-8 lg:grid-cols-4">
        {BENEFICIOS.map((b) => {
          const Icon = ICONOS[b.icono];
          return (
            <div key={b.titulo} className="lg:border-l lg:border-line lg:pl-8 lg:first:border-l-0 lg:first:pl-0">
              <Icon size={30} strokeWidth={1.2} className="text-sage-dark" />
              <h3 className="mt-5 text-2xl text-taupe-dark">{b.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{b.texto}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
