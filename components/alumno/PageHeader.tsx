interface Props {
  eyebrow?: string;
  titulo: React.ReactNode;
  subtitulo?: string;
  /** Acción a la derecha del título (en pantallas anchas). */
  accion?: React.ReactNode;
}

export function PageHeader({ eyebrow, titulo, subtitulo, accion }: Props) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 pt-7 md:pt-10">
      <div className="min-w-0 max-w-2xl">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-2 text-[2.1rem] leading-[1.08] text-taupe-dark md:text-[2.6rem] lg:text-5xl">{titulo}</h1>
        {subtitulo && <p className="mt-2 text-sm leading-relaxed text-ink-soft md:text-base">{subtitulo}</p>}
      </div>
      {accion}
    </header>
  );
}
