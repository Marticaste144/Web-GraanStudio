// Única fuente de verdad para el cálculo financiero de un CompraPack. Se usa siempre desde acá
// (nunca se recalcula "a mano" en un componente) para no correr el riesgo de contar la seña dos
// veces: una seña solo suma al total cuando su propio estado es APLICADA (fue efectivamente
// descontada de este pack), nunca se vuelve a sumar por separado como si fuera un Pago.

export interface ResumenPack {
  valor: number;
  senaAplicada: number;
  otrosPagos: number;
  totalAbonado: number;
  saldoPendiente: number;
}

export function calcularResumenPack(
  compraPack: { precioAplicado: number },
  pagos: { monto: number }[],
  senaAplicada: { monto: number } | null,
): ResumenPack {
  const otrosPagos = pagos.reduce((acc, p) => acc + p.monto, 0);
  const montoSena = senaAplicada?.monto ?? 0;
  const totalAbonado = otrosPagos + montoSena;
  const saldoPendiente = Math.max(0, compraPack.precioAplicado - totalAbonado);
  return { valor: compraPack.precioAplicado, senaAplicada: montoSena, otrosPagos, totalAbonado, saldoPendiente };
}
