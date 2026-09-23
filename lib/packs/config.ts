// Valores por defecto configurables en un solo lugar (no hardcodeados en cada componente).
// Graziella podría cambiar el monto de seña en el futuro: cuando eso deba ser editable desde
// Admin sin redeploy, este archivo es el único lugar a tocar.

/** Monto sugerido por defecto al registrar una seña de alta de alumna nueva. Editable por fila. */
export const MONTO_SENA_SUGERIDO = 20000;

/** Únicos medios de pago que se ofrecen para operaciones NUEVAS (pagos y señas). */
export const MEDIOS_PAGO_NUEVOS = ["Efectivo", "Transferencia"] as const;
export type MedioPagoNuevo = (typeof MEDIOS_PAGO_NUEVOS)[number];
