import { hasTransportAllowance } from './liquidacion';
import { roundPeso } from './money';
import {
  AUXILIO_TRANSPORTE_2026,
  IBC_MAX_SMMLV,
  PENSION_EMPLEADO,
  SALUD_EMPLEADO,
  SMMLV_2026,
  UVT_2026,
  solidarityRate,
} from './values';

export interface SalarioNetoResult {
  salary: number;
  allowance: number;
  ibc: number;
  salud: number;
  pension: number;
  solidarityRate: number;
  solidaridad: number;
  deductions: number;
  net: number;
  /** Ingreso mensual en UVT, para avisar cuando podría haber retención en la fuente. */
  incomeInUvt: number;
}

/** Salario neto de un empleado con salario ordinario (no integral). No calcula retención en la fuente. */
export function salarioNeto(salary: number, otherSalaryIncome = 0): SalarioNetoResult {
  const salarial = salary + otherSalaryIncome;
  const allowance = hasTransportAllowance(salarial) ? AUXILIO_TRANSPORTE_2026 : 0;
  const ibc = Math.min(Math.max(salarial, SMMLV_2026), IBC_MAX_SMMLV * SMMLV_2026);
  const salud = roundPeso(ibc * SALUD_EMPLEADO);
  const pension = roundPeso(ibc * PENSION_EMPLEADO);
  const rate = solidarityRate(ibc / SMMLV_2026);
  const solidaridad = roundPeso(ibc * rate);
  const deductions = salud + pension + solidaridad;
  return {
    salary: salarial,
    allowance,
    ibc,
    salud,
    pension,
    solidarityRate: rate,
    solidaridad,
    deductions,
    net: salarial + allowance - deductions,
    incomeInUvt: salarial / UVT_2026,
  };
}
