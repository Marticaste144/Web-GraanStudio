import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FotoPlaceholder } from "@/components/ui/FotoPlaceholder";
import { Logo } from "@/components/ui/Logo";

interface Props {
  eyebrow: string;
  titulo: React.ReactNode;
  descripcion?: string;
  children: React.ReactNode;
  pie: React.ReactNode;
}

/** Marco común de Iniciar sesión / Crear cuenta: formulario a la izquierda, imagen en pantallas anchas. */
export function AuthShell({ eyebrow, titulo, descripcion, children, pie }: Props) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
      <div className="flex flex-col px-5 py-6 sm:px-10 lg:px-16 xl:px-24">
        <div className="flex items-center justify-between gap-4">
          <Logo size={52} priority />
          <Link href="/" className="inline-flex items-center gap-2 text-xs tracking-wide text-ink-soft hover:text-taupe-dark">
            <ArrowLeft size={14} />
            Volver al sitio
          </Link>
        </div>

        <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10 lg:py-16">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-4 text-[2.6rem] leading-[1.05] text-taupe-dark sm:text-5xl">{titulo}</h1>
          {descripcion && <p className="mt-4 text-sm leading-relaxed text-ink-soft">{descripcion}</p>}
          <div className="mt-8">{children}</div>
          <div className="mt-8 text-center text-sm text-ink-soft">{pie}</div>
        </main>
      </div>

      {/* Panel de imagen (solo escritorio) */}
      <aside className="relative hidden overflow-hidden bg-cream-alt lg:block" aria-hidden>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-12">
          <FotoPlaceholder
            etiqueta="[FOTO DEL ESTUDIO]"
            tono="arena"
            icono="estudio"
            className="aspect-[3/4] w-[62%] max-w-md rounded-t-full bg-cream ring-1 ring-taupe/20"
          />
          <p className="mt-10 text-center font-serif text-2xl uppercase leading-relaxed tracking-[0.2em] text-taupe-dark xl:text-3xl">
            Moverte, respirar
            <br />y conectar
          </p>
        </div>
      </aside>
    </div>
  );
}
