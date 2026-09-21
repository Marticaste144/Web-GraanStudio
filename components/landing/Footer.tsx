import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ESTUDIO } from "@/lib/data/estudio";

export function Footer() {
  const { direccion, contacto } = ESTUDIO;
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.3fr_1fr_1fr] md:px-8">
        <div>
          <Logo size={44} />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-ink-soft">
            Pilates y Yoga en grupos reducidos, en un espacio pensado para vos.
          </p>
        </div>
        <div className="text-sm text-ink-soft">
          <p className="eyebrow mb-4">Visitanos</p>
          <p>{direccion.lugar}</p>
          <p>{direccion.detalle}</p>
          <p>{direccion.zona}</p>
          <p className="mt-3">Lunes a viernes, 08:00 a 19:00</p>
        </div>
        <div className="text-sm text-ink-soft">
          <p className="eyebrow mb-4">Contacto</p>
          <p>{contacto.telefono}</p>
          <p>{contacto.instagram}</p>
          <p>{contacto.email}</p>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-5 text-xs text-ink-soft sm:flex-row sm:items-center sm:justify-between md:px-8">
          <p>© {new Date().getFullYear()} Graan Studio. Todos los derechos reservados.</p>
          <p className="flex gap-5">
            <Link href="/alumno" className="hover:text-taupe-dark">
              Ingreso alumnas
            </Link>
            <Link href="/admin" className="hover:text-taupe-dark">
              Administración
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
