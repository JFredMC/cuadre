import { describe, expect, it, vi } from 'vitest';
import { canShareFiles, rowValue, shareFileName, wrapText } from './share-card';

describe('share-card', () => {
  it('formatea filas como la tarjeta', () => {
    expect(rowValue({ label: 'a', value: 1000, negative: true })).toContain('1.000');
    expect(rowValue({ label: 'a', value: 1000, negative: true }).startsWith('−')).toBe(true);
    expect(rowValue({ label: 'a', value: 0, text: 'No aplica' })).toBe('No aplica');
  });

  it('nombre de archivo sin tildes', () => {
    expect(shareFileName('Liquidación de contrato')).toBe('cuadre-liquidacion-de-contrato.png');
    expect(shareFileName('')).toBe('cuadre-resultado.png');
  });

  it('parte texto en líneas', () => {
    const ctx = {
      measureText: (t: string) => ({ width: t.length * 10 }),
    } as CanvasRenderingContext2D;
    expect(wrapText(ctx, 'uno dos tres cuatro', 80)).toEqual(['uno dos', 'tres', 'cuatro']);
  });

  it('solo usa Web Share con archivos si el navegador lo permite', () => {
    const file = new File(['x'], 'a.png', { type: 'image/png' });
    expect(canShareFiles({} as Navigator, file)).toBe(false);
    const nav = { share: vi.fn(), canShare: vi.fn(() => false) } as unknown as Navigator;
    expect(canShareFiles(nav, file)).toBe(false);
    const ok = { share: vi.fn(), canShare: vi.fn(() => true) } as unknown as Navigator;
    expect(canShareFiles(ok, file)).toBe(true);
  });
});
