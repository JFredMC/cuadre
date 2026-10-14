import { describe, expect, it } from 'vitest';
import {
  ResultDoc,
  breakdown,
  buildResultDoc,
  docFileName,
  generatedLabel,
  readInputs,
} from './result-docs';

const sample: ResultDoc = {
  title: 'Calculadora de prima de servicios 2026',
  totalLabel: 'Tu prima',
  total: 1000000,
  rows: [
    { label: 'Días trabajados', value: 0, text: '180 días' },
    { label: 'Base', value: 2000000, detail: 'salario + auxilio' },
    { label: 'Descuento', value: 5000, negative: true },
  ],
  note: 'Nota de prueba.',
  disclaimer: 'Los resultados son aproximados.',
  generatedAt: new Date('2026-10-14T04:00:00Z'),
  inputs: [{ label: 'Salario mensual', value: '$ 2.000.000' }],
  url: 'https://cuadrelaboral.com/prima/',
};

describe('result-docs', () => {
  it('lee etiquetas y valores del formulario', () => {
    const form = document.createElement('form');
    form.innerHTML = `
      <label class="field"><span>Salario</span><span class="money"><span>$</span><input name="s" value="2.000.000"></span></label>
      <label class="field"><span>Semestre</span><select name="m"><option>Primero</option><option selected>Segundo</option></select></label>
      <label><input type="checkbox" name="c" checked><span>Integral</span></label>`;
    expect(readInputs(form)).toEqual([
      { label: 'Salario', value: '$ 2.000.000' },
      { label: 'Semestre', value: 'Segundo' },
      { label: 'Integral', value: 'Sí' },
    ]);
    expect(readInputs(null)).toEqual([]);
  });

  it('desglose y nombres', () => {
    expect(breakdown(sample)[1][0]).toBe('Base (salario + auxilio)');
    expect(breakdown(sample)[0][1]).toBe('180 días');
    expect(docFileName(sample.title, 'pdf')).toBe(
      'cuadre-calculadora-de-prima-de-servicios-2026.pdf',
    );
    expect(generatedLabel(sample.generatedAt)).toContain('2026');
  });

  it.each(['pdf', 'xlsx', 'docx'] as const)(
    'genera %s',
    async (fmt) => {
      const blob = await buildResultDoc(sample, fmt);
      const head = new Uint8Array(await blob.arrayBuffer()).subarray(0, 4);
      const sig = String.fromCharCode(...head);
      expect(sig).toBe(fmt === 'pdf' ? '%PDF' : 'PK\u0003\u0004');
    },
    20000,
  );
});
