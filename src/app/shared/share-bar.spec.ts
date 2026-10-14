import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { routes } from '../app.routes';
import { Independientes } from '../features/independientes';
import { ShareBar } from './share-bar';

function setup() {
  TestBed.configureTestingModule({ imports: [Independientes], providers: [provideRouter(routes)] });
  const fixture = TestBed.createComponent(Independientes);
  fixture.detectChanges();
  const bar = fixture.debugElement.query(By.directive(ShareBar)).componentInstance as ShareBar;
  return { fixture, bar };
}

describe('ShareBar', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete (navigator as unknown as Record<string, unknown>)['share'];
    delete (navigator as unknown as Record<string, unknown>)['canShare'];
  });

  it('toma los datos de la tarjeta de resultados', () => {
    const { bar, fixture } = setup();
    const data = bar.cardData()!;
    expect(data.totalLabel).toBe('Pagas al mes en la PILA');
    expect(data.rows.length).toBeGreaterThan(0);
    expect(data.total).toBe(580440);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid="download-card"]')?.getAttribute('aria-label')).toBe(
      'Descargar imagen del resultado',
    );
  });

  it('comparte imagen + texto cuando el navegador lo permite', async () => {
    const { bar } = setup();
    const file = new File(['x'], 'cuadre.png', { type: 'image/png' });
    vi.spyOn(bar, 'makeFile').mockResolvedValue(file);
    const share = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { share, canShare: () => true });
    const ev = new Event('click', { cancelable: true });
    await bar.shareImage(ev);
    expect(ev.defaultPrevented).toBe(true);
    expect(share).toHaveBeenCalledWith(
      expect.objectContaining({ files: [file], text: expect.stringContaining('580.440') }),
    );
  });

  it('sin Web Share deja el enlace de wa.me', async () => {
    const { bar } = setup();
    const ev = new Event('click', { cancelable: true });
    await bar.shareImage(ev);
    expect(ev.defaultPrevented).toBe(false);
  });

  it('si no puede compartir archivos abre wa.me', async () => {
    const { bar } = setup();
    vi.spyOn(bar, 'makeFile').mockResolvedValue(new File(['x'], 'a.png'));
    Object.assign(navigator, { share: vi.fn(), canShare: () => false });
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    await bar.shareImage(new Event('click', { cancelable: true }));
    expect(open).toHaveBeenCalledWith(
      expect.stringMatching(/^https:\/\/wa\.me\//),
      '_blank',
      'noopener,noreferrer',
    );
  });
});
