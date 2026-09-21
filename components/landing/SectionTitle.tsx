interface Props {
  eyebrow: string;
  titulo: React.ReactNode;
  descripcion?: string;
  centrado?: boolean;
}

export function SectionTitle({ eyebrow, titulo, descripcion, centrado }: Props) {
  return (
    <div className={centrado ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-4 text-[2.2rem] leading-[1.1] text-taupe-dark md:text-5xl">{titulo}</h2>
      {descripcion && <p className="mt-5 leading-relaxed text-ink-soft">{descripcion}</p>}
    </div>
  );
}
