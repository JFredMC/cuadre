import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DOCUMENT, Type } from '@angular/core';
import { routes } from '../app.routes';
import { HorasExtras } from './horas-extras';
import { Independientes } from './independientes';
import { Intereses } from './intereses';
import { Liquidacion } from './liquidacion';
import { Plantillas } from './plantillas';
import { Prima } from './prima';
import { SalarioNeto } from './salario-neto';

const cases: [Type<unknown>, string, string][] = [
  [Liquidacion, 'Calculadora de liquidación laboral 2026', '2.092.348'],
  [SalarioNeto, 'Calculadora de salario neto 2026', '1.859.928'],
  [Prima, 'Calculadora de prima de servicios 2026', '1.000.000'],
  [Intereses, 'Calculadora de intereses de cesantías', '240.000'],
  [HorasExtras, 'Calculadora de horas extras y recargos 2026', '122.000'],
  [Independientes, 'Seguridad social para independientes 2026', '580.440'],
];

describe('páginas de calculadoras', () => {
  for (const [component, h1, total] of cases) {
    it(`${h1}: resultado por defecto, fuente, aviso y FAQ JSON-LD`, () => {
      TestBed.configureTestingModule({ imports: [component], providers: [provideRouter(routes)] });
      const fixture = TestBed.createComponent(component);
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('h1')?.textContent).toContain(h1);
      expect(el.querySelector('[data-testid="total"]')?.textContent).toContain(total);
      expect(el.textContent).toContain('Valores actualizados a 13 de octubre de 2026');
      expect(el.textContent).toContain('no constituyen asesoría legal');
      expect(el.querySelector('.sources a')?.getAttribute('target')).toBe('_blank');
      expect(el.querySelector('.btn-wa')?.getAttribute('href')).toMatch(
        /^https:\/\/wa\.me\/\?text=/,
      );
      const doc = TestBed.inject(DOCUMENT);
      expect(doc.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toMatch(
        /^https:\/\/cuadrelaboral\.com\/.+\/$/,
      );
      expect(doc.head.querySelector('script[data-seo]')?.textContent).toContain('FAQPage');
    });
  }

  it('no muestra espacios de AdSense si no hay cliente configurado', () => {
    TestBed.configureTestingModule({ imports: [Liquidacion], providers: [provideRouter(routes)] });
    const fixture = TestBed.createComponent(Liquidacion);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.adsbygoogle')).toBeNull();
  });
});

describe('página de plantillas', () => {
  it('muestra las tres plantillas con botón Comprar, combo y muestra descargable', () => {
    TestBed.configureTestingModule({ imports: [Plantillas], providers: [provideRouter(routes)] });
    const fixture = TestBed.createComponent(Plantillas);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h1')?.textContent).toContain('Plantillas de Excel');
    expect(el.querySelectorAll('.plantilla').length).toBe(3);
    expect(el.textContent).not.toContain('Próximamente');
    expect(el.querySelectorAll('button[data-testid^="buy-"]').length).toBe(4);
    expect(el.textContent).not.toContain('Hotmart');
    expect(el.querySelector('a[download]')?.getAttribute('href')).toContain('MUESTRA.xlsx');
  });
});

describe('pagos de plantillas', () => {
  it('arma la URL del Web Checkout con la llave pública, la firma y la redirección', async () => {
    const { PaymentsService, PAYMENTS } = await import('../core/payments');
    const url = new URL(
      new PaymentsService().buildCheckoutUrl(
        {
          reference: 'CUA-NOMINA-X',
          amountInCents: 2_990_000,
          currency: 'COP',
          signature: 'abc',
          redirectUrl: 'https://cuadrelaboral.com/plantillas/gracias',
        },
        'a@b.co',
      ),
    );
    expect(url.origin + url.pathname).toBe(PAYMENTS.checkoutUrl);
    expect(url.searchParams.get('public-key')).toMatch(/^pub_prod_/);
    expect(url.searchParams.get('amount-in-cents')).toBe('2990000');
    expect(url.searchParams.get('signature:integrity')).toBe('abc');
    expect(url.searchParams.get('customer-data:email')).toBe('a@b.co');
    expect(url.searchParams.get('redirect-url')).toBe(
      'https://cuadrelaboral.com/plantillas/gracias?ref=CUA-NOMINA-X',
    );
  });

  it('la página de gracias se renderiza sin red (estado inicial)', async () => {
    const { PlantillasGracias } = await import('./plantillas-gracias');
    TestBed.configureTestingModule({
      imports: [PlantillasGracias],
      providers: [provideRouter(routes)],
    });
    const fixture = TestBed.createComponent(PlantillasGracias);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('h1')?.textContent).toContain(
      'Gracias',
    );
  });
});
