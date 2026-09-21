interface Props {
  eyebrow?: string;
  titulo: React.ReactNode;
  subtitulo?: string;
  /** Acción a la derecha del título (en pantallas anchas). */
  accion?: React.ReactNode;
}

export function PageHeader({ eyebrow, titulo, subtitulo, accion }: Props) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 pb-2 pt-8 md:pt-12">
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-3 text-[2.4rem] leading-[1.05] text-taupe-dark md:text-5xl lg:text-[3.4rem]">{titulo}</h1>
        {subtitulo && <p className="mt-3 text-sm leading-relaxed text-ink-soft md:text-base">{subtitulo}</p>}
      </div>
      {accion}
    </header>
  );
}
