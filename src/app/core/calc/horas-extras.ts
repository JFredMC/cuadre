import { roundPeso } from './money';
import {
  EXTRA_DIURNA,
  EXTRA_NOCTURNA,
  RECARGO_NOCTURNO,
  nightStartHourAt,
  sundaySurchargeAt,
  weeklyHoursAt,
} from './values';

export type HourKind =
  | 'extraDiurna'
  | 'extraNocturna'
  | 'recargoNocturno'
  | 'dominical'
  | 'dominicalNocturno'
  | 'extraDiurnaDominical'
  | 'extraNocturnaDominical';

export const HOUR_KINDS: readonly HourKind[] = [
  'extraDiurna',
  'extraNocturna',
  'recargoNocturno',
  'dominical',
  'dominicalNocturno',
  'extraDiurnaDominical',
  'extraNocturnaDominical',
];

export interface HoursRegime {
  weeklyHours: number;
  monthlyHours: number;
  sundaySurcharge: number;
  nightStartHour: number;
}

/** Jornada y recargos vigentes en una fecha. Horas mensuales = horas semanales × 5 (30 días / 6). */
export function regimeAt(isoDate: string): HoursRegime {
  const weeklyHours = weeklyHoursAt(isoDate);
  return {
    weeklyHours,
    monthlyHours: weeklyHours * 5,
    sundaySurcharge: sundaySurchargeAt(isoDate),
    nightStartHour: nightStartHourAt(isoDate),
  };
}

/**
 * Factor que se paga sobre la hora ordinaria. Las horas extra se pagan completas (1 + recargo);
 * los recargos sobre horas ordinarias solo pagan el adicional, porque la hora ya va en el salario.
 */
export function hourFactor(kind: HourKind, sunday: number): number {
  switch (kind) {
    case 'extraDiurna':
      return 1 + EXTRA_DIURNA;
    case 'extraNocturna':
      return 1 + EXTRA_NOCTURNA;
    case 'recargoNocturno':
      return RECARGO_NOCTURNO;
    case 'dominical':
      return sunday;
    case 'dominicalNocturno':
      return sunday + RECARGO_NOCTURNO;
    case 'extraDiurnaDominical':
      return 1 + EXTRA_DIURNA + sunday;
    case 'extraNocturnaDominical':
      return 1 + EXTRA_NOCTURNA + sunday;
  }
}

export interface HorasExtrasLine {
  kind: HourKind;
  hours: number;
  factor: number;
  value: number;
}

export interface HorasExtrasResult {
  regime: HoursRegime;
  hourlyRate: number;
  lines: HorasExtrasLine[];
  total: number;
}

export function horasExtras(
  salary: number,
  isoDate: string,
  hours: Partial<Record<HourKind, number>>,
): HorasExtrasResult {
  const regime = regimeAt(isoDate);
  const hourlyRate = salary / regime.monthlyHours;
  const lines = HOUR_KINDS.filter((k) => (hours[k] ?? 0) > 0).map((kind) => {
    const factor = hourFactor(kind, regime.sundaySurcharge);
    const h = hours[kind] ?? 0;
    return { kind, hours: h, factor, value: roundPeso(hourlyRate * factor * h) };
  });
  return { regime, hourlyRate, lines, total: lines.reduce((s, l) => s + l.value, 0) };
}
