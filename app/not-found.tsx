import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export const metadata = { title: "No encontramos la página · Graan Studio" };

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-cream px-5 py-16 text-center">
      <div className="max-w-md">
        <div className="flex justify-center">
          <Logo size={64} />
        </div>
        <p className="eyebrow mt-10">Error 404</p>
        <h1 className="mt-3 text-4xl text-taupe-dark sm:text-5xl">
          No encontramos <span className="italic text-sage-deep">esa página</span>
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">
          Puede que el enlace esté mal escrito o que la página ya no exista.
        </p>
        <Link href="/" className="btn btn-primary mt-8">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
