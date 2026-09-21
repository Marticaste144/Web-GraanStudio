/**
 * Muestra un importe con el símbolo $ común.
 *
 * La tipografía serif de títulos (Playfair Display) dibuja el "$" con un trazo doble muy estilizado.
 * Para que el símbolo sea siempre el habitual, el "$" se escribe con la tipografía sans de la marca
 * y el resto del número queda en la serif. Usar este componente en todo importe que esté en serif.
 */
export function Importe({ valor }: { valor: string }) {
  if (!valor.startsWith("$")) return <>{valor}</>;
  return (
    <>
      <span className="font-sans text-[0.78em] font-normal">$</span>
      {valor.slice(1)}
    </>
  );
}
