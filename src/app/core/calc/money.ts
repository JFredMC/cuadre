export const roundPeso = (value: number) => Math.round(value);

const cop = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

/** Formato $ 1.750.905 */
export const formatCop = (value: number) => cop.format(roundPeso(value)).replace(/\u00a0/g, ' ');
