/**
 * Valores legales usados por las calculadoras. Cada valor cita su norma oficial.
 * Actualizar `VALUES_UPDATED_AT` cada vez que cambie algo aquí.
 */
export const VALUES_UPDATED_AT = '2026-10-13';

export interface LegalSource {
  readonly id: string;
  readonly label: string;
  readonly url: string;
}

export const SOURCES = {
  smmlv: {
    id: 'smmlv',
    label: 'Decreto 1469 de 2025 y Decreto 0159 de 2026 (salario mínimo 2026)',
    url: 'https://normativa.colpensiones.gov.co/compilacion/docs/decreto_0159_2026.htm',
  },
  auxilio: {
    id: 'auxilio',
    label: 'Decreto 1470 de 2025 (auxilio de transporte 2026)',
    url: 'https://normativa.colpensiones.gov.co/compilacion/docs/decreto_1470_2025.htm',
  },
  uvt: {
    id: 'uvt',
    label: 'Resolución DIAN 000238 de 2025 (UVT 2026)',
    url: 'https://normograma.dian.gov.co/dian/compilacion/docs/resolucion_dian_0238_2025.htm',
  },
  jornada: {
    id: 'jornada',
    label: 'Ley 2101 de 2021 (reducción gradual de la jornada a 42 horas)',
    url: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=166506',
  },
  reforma: {
    id: 'reforma',
    label: 'Ley 2466 de 2025, arts. 10 y 14 (jornada nocturna y recargo dominical)',
    url: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=260676',
  },
  cst: {
    id: 'cst',
    label: 'Código Sustantivo del Trabajo (arts. 168, 186, 249, 306)',
    url: 'http://www.secretariasenado.gov.co/senado/basedoc/codigo_sustantivo_trabajo.html',
  },
  intereses: {
    id: 'intereses',
    label: 'Ley 52 de 1975 (intereses sobre cesantías, 12% anual)',
    url: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=65221',
  },
  ley100: {
    id: 'ley100',
    label: 'Ley 100 de 1993, arts. 20, 27 y 204 (pensión, solidaridad y salud)',
    url: 'http://www.secretariasenado.gov.co/senado/basedoc/ley_0100_1993.html',
  },
  independientes: {
    id: 'independientes',
    label: 'UGPP: IBC del 40% para independientes (ABC 2026 y Decreto 0379 de 2026)',
    url: 'https://www.ugpp.gov.co/wp-content/uploads/2026/01/ABC-Omiso-2026.pdf',
  },
  arl: {
    id: 'arl',
    label: 'Decreto 1295 de 1994, art. 26 (tarifas de riesgos laborales)',
    url: 'http://www.secretariasenado.gov.co/senado/basedoc/decreto_1295_1994.html',
  },
} satisfies Record<string, LegalSource>;

/** Salario mínimo legal mensual vigente 2026. */
export const SMMLV_2026 = 1_750_905;
/** Auxilio de transporte 2026 (para quien gana hasta 2 SMMLV). */
export const AUXILIO_TRANSPORTE_2026 = 249_095;
/** Unidad de Valor Tributario 2026. */
export const UVT_2026 = 52_374;

/** Fecha ISO (yyyy-mm-dd) a partir de la cual rige cada valor. */
type Step<T> = readonly [from: string, value: T];

function stepAt<T>(steps: readonly Step<T>[], isoDate: string): T {
  let current = steps[0][1];
  for (const [from, value] of steps) if (isoDate >= from) current = value;
  return current;
}

/** Jornada máxima semanal (Ley 2101 de 2021): 44 h desde el 15-jul-2025 y 42 h desde el 15-jul-2026. */
const JORNADA_STEPS: readonly Step<number>[] = [
  ['2023-07-15', 47],
  ['2024-07-15', 46],
  ['2025-07-15', 44],
  ['2026-07-15', 42],
];
export const weeklyHoursAt = (isoDate: string) => stepAt(JORNADA_STEPS, isoDate);

/** Recargo por trabajo en día de descanso obligatorio (Ley 2466 de 2025, art. 14). */
const DOMINICAL_STEPS: readonly Step<number>[] = [
  ['2000-01-01', 0.75],
  ['2025-07-01', 0.8],
  ['2026-07-01', 0.9],
  ['2027-07-01', 1],
];
export const sundaySurchargeAt = (isoDate: string) => stepAt(DOMINICAL_STEPS, isoDate);

/** Hora en que empieza el trabajo nocturno (Ley 2466 de 2025, art. 10: 7:00 p. m. desde el 25-dic-2025). */
const NIGHT_START_STEPS: readonly Step<number>[] = [
  ['2000-01-01', 21],
  ['2025-12-25', 19],
];
export const nightStartHourAt = (isoDate: string) => stepAt(NIGHT_START_STEPS, isoDate);

/** Recargos del CST (arts. 168 y 179). */
export const RECARGO_NOCTURNO = 0.35;
export const EXTRA_DIURNA = 0.25;
export const EXTRA_NOCTURNA = 0.75;

/** Aportes del trabajador dependiente (Ley 100 de 1993). */
export const SALUD_EMPLEADO = 0.04;
export const PENSION_EMPLEADO = 0.04;
/** Aportes del independiente sobre su IBC. */
export const SALUD_INDEPENDIENTE = 0.125;
export const PENSION_INDEPENDIENTE = 0.16;
/** IBC mínimo del independiente: 40% del ingreso mensual. */
export const IBC_INDEPENDIENTE = 0.4;
/** Tope del IBC: 25 SMMLV. */
export const IBC_MAX_SMMLV = 25;

/** Tarifas ARL por clase de riesgo (Decreto 1295 de 1994, tarifa inicial). */
export const ARL_RATES: Record<1 | 2 | 3 | 4 | 5, number> = {
  1: 0.00522,
  2: 0.01044,
  3: 0.02436,
  4: 0.0435,
  5: 0.0696,
};

/**
 * Fondo de Solidaridad Pensional (Ley 100 de 1993, art. 27, modificado por la Ley 797 de 2003).
 * Los porcentajes de la Ley 2381 de 2024 no se aplican mientras la reforma pensional siga suspendida.
 */
export function solidarityRate(ibcInSmmlv: number): number {
  if (ibcInSmmlv < 4) return 0;
  if (ibcInSmmlv < 16) return 0.01;
  if (ibcInSmmlv <= 17) return 0.012;
  if (ibcInSmmlv <= 18) return 0.014;
  if (ibcInSmmlv <= 19) return 0.016;
  if (ibcInSmmlv <= 20) return 0.018;
  return 0.02;
}

/** Intereses sobre cesantías: 12% anual. */
export const INTERESES_CESANTIAS = 0.12;
