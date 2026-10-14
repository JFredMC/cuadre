import {
  SMMLV_2026,
  benefitsBase,
  cesantias,
  days360,
  formatCop,
  horasExtras,
  hourFactor,
  independiente,
  interesesCesantias,
  liquidacion,
  nightStartHourAt,
  prima,
  regimeAt,
  salarioNeto,
  solidarityRate,
  sundaySurchargeAt,
  vacaciones,
  weeklyHoursAt,
} from './index';

describe('days360 (año comercial)', () => {
  it('cuenta un año completo como 360 días', () =>
    expect(days360('2026-01-01', '2026-12-31')).toBe(360));
  it('cuenta febrero completo como 30 días', () =>
    expect(days360('2026-02-01', '2026-02-28')).toBe(30));
  it('incluye el día inicial y el final', () =>
    expect(days360('2026-01-15', '2026-01-15')).toBe(1));
  it('devuelve 0 si las fechas están invertidas', () =>
    expect(days360('2026-03-01', '2026-02-01')).toBe(0));
});

describe('valores 2026 por fecha', () => {
  it('jornada de 44 h hasta el 14-jul-2026 y 42 h desde el 15-jul-2026', () => {
    expect(weeklyHoursAt('2026-07-14')).toBe(44);
    expect(weeklyHoursAt('2026-07-15')).toBe(42);
  });
  it('recargo dominical 80% hasta el 30-jun-2026, 90% desde el 1-jul-2026 y 100% desde 2027', () => {
    expect(sundaySurchargeAt('2026-06-30')).toBe(0.8);
    expect(sundaySurchargeAt('2026-07-01')).toBe(0.9);
    expect(sundaySurchargeAt('2027-07-01')).toBe(1);
  });
  it('trabajo nocturno desde las 7:00 p. m. a partir del 25-dic-2025', () => {
    expect(nightStartHourAt('2025-12-24')).toBe(21);
    expect(nightStartHourAt('2025-12-25')).toBe(19);
  });
  it('fondo de solidaridad según IBC en salarios mínimos', () => {
    expect(solidarityRate(3.99)).toBe(0);
    expect(solidarityRate(4)).toBe(0.01);
    expect(solidarityRate(16.5)).toBe(0.012);
    expect(solidarityRate(21)).toBe(0.02);
  });
});

describe('fórmulas básicas', () => {
  it('base con auxilio para salario mínimo: 1.750.905 + 249.095 = 2.000.000', () =>
    expect(benefitsBase(SMMLV_2026)).toBe(2_000_000));
  it('sin auxilio por encima de 2 SMMLV', () => expect(benefitsBase(4_000_000)).toBe(4_000_000));
  it('cesantías de un año con base 2.000.000 = 2.000.000', () =>
    expect(cesantias(2_000_000, 360)).toBe(2_000_000));
  it('intereses de 1.000.000 de cesantías por un año = 120.000 (12%)', () =>
    expect(interesesCesantias(1_000_000, 360)).toBe(120_000));
  it('intereses por 180 días = 60.000 (6%)', () =>
    expect(interesesCesantias(1_000_000, 180)).toBe(60_000));
  it('prima de un semestre completo con base 2.000.000 = 1.000.000', () =>
    expect(prima(2_000_000, 180)).toBe(1_000_000));
  it('vacaciones de un año con salario 3.000.000 = 1.500.000 (15 días)', () =>
    expect(vacaciones(3_000_000, 360)).toBe(1_500_000));
});

describe('liquidación', () => {
  it('salario mínimo del 1-feb-2026 al 31-ago-2026', () => {
    const r = liquidacion({ start: '2026-02-01', end: '2026-08-31', salary: SMMLV_2026 });
    expect(r.totalDays).toBe(210);
    expect(r.cesantiasDays).toBe(210);
    expect(r.primaDays).toBe(60);
    expect(r.cesantias).toBe(1_166_667);
    expect(r.intereses).toBe(81_667);
    expect(r.prima).toBe(333_333);
    expect(r.vacationDays).toBeCloseTo(8.75);
    expect(r.vacaciones).toBe(510_681);
    expect(r.total).toBe(2_092_348);
  });
  it('contrato de años anteriores: cesantías solo desde el 1 de enero', () => {
    const r = liquidacion({
      start: '2024-03-01',
      end: '2026-03-31',
      salary: 5_000_000,
      vacationDaysTaken: 30,
    });
    expect(r.includeAllowance).toBe(false);
    expect(r.cesantiasDays).toBe(90);
    expect(r.cesantias).toBe(1_250_000);
    expect(r.intereses).toBe(37_500);
    expect(r.prima).toBe(1_250_000);
    // 750 días → 31,25 días de vacaciones menos 30 tomados = 1,25 días
    expect(r.vacaciones).toBe(208_333);
  });
  it('rechaza fechas invertidas', () =>
    expect(() => liquidacion({ start: '2026-05-01', end: '2026-04-01', salary: 1 })).toThrow());
});

describe('salario neto', () => {
  it('salario mínimo: 1.750.905 + 249.095 − 70.036 − 70.036 = 1.859.928', () => {
    const r = salarioNeto(SMMLV_2026);
    expect(r.salud).toBe(70_036);
    expect(r.pension).toBe(70_036);
    expect(r.solidaridad).toBe(0);
    expect(r.allowance).toBe(249_095);
    expect(r.net).toBe(1_859_928);
  });
  it('8.000.000: sin auxilio y con 1% de fondo de solidaridad', () => {
    const r = salarioNeto(8_000_000);
    expect(r.allowance).toBe(0);
    expect(r.solidarityRate).toBe(0.01);
    expect(r.deductions).toBe(720_000);
    expect(r.net).toBe(7_280_000);
  });
});

describe('horas extras y recargos', () => {
  it('desde el 15-jul-2026: 42 h semanales, 210 h mensuales y dominical del 90%', () => {
    expect(regimeAt('2026-08-01')).toEqual({
      weeklyHours: 42,
      monthlyHours: 210,
      sundaySurcharge: 0.9,
      nightStartHour: 19,
    });
  });
  it('factores sobre la hora ordinaria', () => {
    expect(hourFactor('extraDiurna', 0.9)).toBe(1.25);
    expect(hourFactor('extraNocturna', 0.9)).toBe(1.75);
    expect(hourFactor('recargoNocturno', 0.9)).toBe(0.35);
    expect(hourFactor('dominicalNocturno', 0.9)).toBeCloseTo(1.25);
    expect(hourFactor('extraDiurnaDominical', 0.9)).toBeCloseTo(2.15);
    expect(hourFactor('extraNocturnaDominical', 0.9)).toBeCloseTo(2.65);
  });
  it('salario 2.100.000 en agosto de 2026 (hora ordinaria 10.000)', () => {
    const r = horasExtras(2_100_000, '2026-08-01', {
      extraDiurna: 2,
      recargoNocturno: 4,
      dominical: 8,
      extraNocturnaDominical: 1,
    });
    expect(r.hourlyRate).toBe(10_000);
    expect(r.lines.map((l) => l.value)).toEqual([25_000, 14_000, 72_000, 26_500]);
    expect(r.total).toBe(137_500);
  });
  it('junio de 2026: 220 h mensuales y dominical del 80%', () => {
    const r = horasExtras(2_200_000, '2026-06-15', { dominical: 8 });
    expect(r.hourlyRate).toBe(10_000);
    expect(r.total).toBe(64_000);
  });
});

describe('seguridad social de independientes', () => {
  it('ingreso 5.000.000 con ARL riesgo I: IBC 2.000.000 y total 580.440', () => {
    const r = independiente(5_000_000, 1);
    expect(r.ibc).toBe(2_000_000);
    expect(r.salud).toBe(250_000);
    expect(r.pension).toBe(320_000);
    expect(r.arl).toBe(10_440);
    expect(r.total).toBe(580_440);
  });
  it('ingreso menor a 1 SMMLV: no está obligado y el IBC mínimo es 1 SMMLV', () => {
    const r = independiente(1_000_000);
    expect(r.required).toBe(false);
    expect(r.ibc).toBe(SMMLV_2026);
  });
  it('ingreso 100.000.000: IBC de 40.000.000 con 2% de solidaridad', () => {
    const r = independiente(100_000_000);
    expect(r.solidaridad).toBe(800_000);
  });
  it('IBC topado en 25 SMMLV', () => expect(independiente(200_000_000).ibc).toBe(25 * SMMLV_2026));
});

describe('formato', () => {
  it('pesos colombianos sin decimales', () => expect(formatCop(1_750_905)).toMatch(/1\.750\.905/));
});
