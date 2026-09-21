import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface Props {
  titulo: string;
  subtitulo?: string;
  volverA?: string;
  volverLabel?: string;
}

export function PageHeader({ titulo, subtitulo, volverA = "/alumno", volverLabel = "Inicio" }: Props) {
  return (
    <header className="px-5 pb-2 pt-6">
      <Link
        href={volverA}
        className="-ml-1 inline-flex items-center gap-1 text-sm text-ink-soft transition-colors hover:text-taupe-dark"
      >
        <ChevronLeft size={16} />
        {volverLabel}
      </Link>
      <h1 className="mt-4 text-[2.6rem] text-taupe-dark">{titulo}</h1>
      {subtitulo && <p className="mt-2 text-sm leading-relaxed text-ink-soft">{subtitulo}</p>}
    </header>
  );
}
