import { days360, maxIso, parseIso } from './dates';
import { roundPeso } from './money';
import { AUXILIO_TRANSPORTE_2026, INTERESES_CESANTIAS, SMMLV_2026 } from './values';

/** El auxilio de transporte se paga (y es base de prestaciones) a quien gana hasta 2 SMMLV. */
export const hasTransportAllowance = (salary: number) => salary <= 2 * SMMLV_2026;

/** Base de prima y cesantías: salario + auxilio de transporte cuando aplica. */
export const benefitsBase = (salary: number, includeAllowance = hasTransportAllowance(salary)) =>
  salary + (includeAllowance ? AUXILIO_TRANSPORTE_2026 : 0);

/** Cesantías: base × días / 360 (CST art. 249). */
export const cesantias = (base: number, days: number) => (base * days) / 360;
/** Intereses sobre cesantías: cesantías × días × 12% / 360 (Ley 52 de 1975). */
export const interesesCesantias = (cesantiasValue: number, days: number) =>
  (cesantiasValue * days * INTERESES_CESANTIAS) / 360;
/** Prima de servicios: base × días del semestre / 360 (CST art. 306). */
export const prima = (base: number, days: number) => (base * days) / 360;
/** Vacaciones: 15 días hábiles por año → salario × días / 720 (CST art. 186), sin auxilio. */
export const vacaciones = (salary: number, days: number) => (salary * days) / 720;

export interface LiquidacionInput {
  /** Fecha de inicio del contrato (yyyy-mm-dd). */
  start: string;
  /** Fecha de terminación (yyyy-mm-dd). */
  end: string;
  /** Salario mensual básico. */
  salary: number;
  /** Días de vacaciones ya disfrutados o pagados. */
  vacationDaysTaken?: number;
  /** Fuerza incluir o excluir el auxilio de transporte. Por defecto, según el salario. */
  includeAllowance?: boolean;
}

export interface LiquidacionResult {
  base: number;
  includeAllowance: boolean;
  totalDays: number;
  cesantiasDays: number;
  primaDays: number;
  cesantias: number;
  intereses: number;
  prima: number;
  vacationDays: number;
  vacaciones: number;
  total: number;
}

/**
 * Liquidación al terminar el contrato. Supone que las cesantías de años anteriores ya se
 * consignaron (corte al 31 de diciembre) y que la prima del semestre anterior ya se pagó.
 */
export function liquidacion(input: LiquidacionInput): LiquidacionResult {
  const { start, end, salary } = input;
  if (end < start) throw new Error('La fecha de terminación debe ser posterior al inicio.');
  const includeAllowance = input.includeAllowance ?? hasTransportAllowance(salary);
  const base = benefitsBase(salary, includeAllowance);
  const e = parseIso(end);
  const yearStart = `${e.y}-01-01`;
  const semesterStart = e.m <= 6 ? `${e.y}-01-01` : `${e.y}-07-01`;

  const totalDays = days360(start, end);
  const cesantiasDays = days360(maxIso(start, yearStart), end);
  const primaDays = days360(maxIso(start, semesterStart), end);
  const vacationDays = Math.max(0, (totalDays * 15) / 360 - (input.vacationDaysTaken ?? 0));

  const ces = roundPeso(cesantias(base, cesantiasDays));
  const int = roundPeso(interesesCesantias(ces, cesantiasDays));
  const pri = roundPeso(prima(base, primaDays));
  const vac = roundPeso((salary / 30) * vacationDays);
  return {
    base,
    includeAllowance,
    totalDays,
    cesantiasDays,
    primaDays,
    cesantias: ces,
    intereses: int,
    prima: pri,
    vacationDays,
    vacaciones: vac,
    total: ces + int + pri + vac,
  };
}
