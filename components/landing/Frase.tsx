/** Frase destacada: serif editorial en mayúsculas espaciadas. */
export function Frase() {
  const Punto = () => (
    <span aria-hidden className="hidden text-sage-soft sm:inline">
      ·
    </span>
  );
  return (
    <section aria-label="Lema" className="bg-sage-deep">
      <p className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-5 py-10 text-center font-serif text-xl uppercase leading-none tracking-[0.22em] text-cream sm:flex-row sm:justify-center sm:gap-5 sm:text-xl md:gap-8 md:px-8 md:py-14 md:text-2xl lg:gap-12 lg:text-3xl lg:tracking-[0.3em]">
        <span>Moverte</span>
        <Punto />
        <span>Respirar</span>
        <Punto />
        <span>Conectar</span>
      </p>
    </section>
  );
}
