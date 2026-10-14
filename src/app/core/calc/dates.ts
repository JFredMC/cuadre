/** Utilidades de fechas ISO (yyyy-mm-dd) sin zonas horarias. */

export interface YMD {
  y: number;
  m: number;
  d: number;
}

export function parseIso(iso: string): YMD {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) throw new Error(`Fecha inválida: ${iso}`);
  return { y: +match[1], m: +match[2], d: +match[3] };
}

export const toIso = ({ y, m, d }: YMD) =>
  `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

const lastDayOfMonth = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();

/**
 * Días laborados en año comercial de 360 días (meses de 30), contando el día inicial y el final,
 * como se liquidan prestaciones en Colombia. El último día de cualquier mes cuenta como día 30.
 */
export function days360(startIso: string, endIso: string): number {
  if (endIso < startIso) return 0;
  const s = parseIso(startIso);
  const e = parseIso(endIso);
  const d1 = Math.min(s.d, 30);
  const d2 = e.d === lastDayOfMonth(e.y, e.m) ? 30 : Math.min(e.d, 30);
  return (e.y - s.y) * 360 + (e.m - s.m) * 30 + (d2 - d1) + 1;
}

export const maxIso = (a: string, b: string) => (a > b ? a : b);
