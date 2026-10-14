import { roundPeso } from './money';
import {
  ARL_RATES,
  IBC_INDEPENDIENTE,
  IBC_MAX_SMMLV,
  PENSION_INDEPENDIENTE,
  SALUD_INDEPENDIENTE,
  SMMLV_2026,
  solidarityRate,
} from './values';

export type RiskClass = 0 | 1 | 2 | 3 | 4 | 5;

export interface IndependienteResult {
  income: number;
  /** Con ingreso neto inferior a 1 SMMLV no hay obligación de cotizar. */
  required: boolean;
  ibc: number;
  salud: number;
  pension: number;
  solidarityRate: number;
  solidaridad: number;
  arlRate: number;
  arl: number;
  total: number;
}

/**
 * Aportes mensuales de un independiente: IBC = 40% del ingreso mensual (mínimo 1 SMMLV,
 * máximo 25 SMMLV). `riskClass` 0 significa sin ARL. No aplica depuración de costos.
 */
export function independiente(income: number, riskClass: RiskClass = 0): IndependienteResult {
  const required = income >= SMMLV_2026;
  const ibc = Math.min(
    Math.max(income * IBC_INDEPENDIENTE, SMMLV_2026),
    IBC_MAX_SMMLV * SMMLV_2026,
  );
  const salud = roundPeso(ibc * SALUD_INDEPENDIENTE);
  const pension = roundPeso(ibc * PENSION_INDEPENDIENTE);
  const rate = solidarityRate(ibc / SMMLV_2026);
  const solidaridad = roundPeso(ibc * rate);
  const arlRate = riskClass === 0 ? 0 : ARL_RATES[riskClass];
  const arl = roundPeso(ibc * arlRate);
  return {
    income,
    required,
    ibc,
    salud,
    pension,
    solidarityRate: rate,
    solidaridad,
    arlRate,
    arl,
    total: salud + pension + solidaridad + arl,
  };
}
