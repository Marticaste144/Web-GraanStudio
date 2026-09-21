import Link from "next/link";

export function CtaFinal() {
  return (
    <section className="bg-taupe-dark text-cream">
      <div className="mx-auto max-w-3xl px-5 py-24 text-center md:px-8 md:py-28">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-sage">Tu lugar te espera</p>
        <h2 className="mt-5 text-5xl md:text-6xl">
          Sumate a <span className="italic text-sage">Graan Studio</span>
        </h2>
        <p className="mx-auto mt-6 max-w-md leading-relaxed text-cream/75">
          Creá tu cuenta, elegí tus horarios fijos y empezá a moverte esta semana.
        </p>
        <Link
          href="/alumno"
          className="btn mt-10 bg-cream px-8 text-taupe-dark hover:bg-cream-alt"
        >
          Crear cuenta gratis
        </Link>
      </div>
    </section>
  );
}
