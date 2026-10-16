import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LAST_ORDER_KEY, PaymentsService, type Sku } from '../core/payments';
import { SeoService } from '../core/seo.service';

interface Plantilla {
  id: Sku;
  name: string;
  blurb: string;
  price: string;
  image: string;
  sample: string;
}

@Component({
  selector: 'app-plantillas',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="hero">
      <p class="eyebrow"><a routerLink="/">← Calculadoras</a></p>
      <h1>Plantillas de Excel para Colombia 2026</h1>
      <p class="lead">
        Las mismas fórmulas de Cuadre, listas para tu equipo o tu casa. Celdas amarillas para
        llenar, el resto se calcula solo. Valores 2026 (SMMLV, auxilio, jornada y recargos).
      </p>
    </section>

    <div class="card buyer">
      <label for="buyer-email">Tu correo (opcional)</label>
      <input
        id="buyer-email"
        type="email"
        autocomplete="email"
        inputmode="email"
        placeholder="tucorreo@ejemplo.com"
        [value]="email()"
        (input)="email.set($any($event.target).value)"
      />
      <small
        >Pagas con Wompi (PSE, Nequi, tarjeta o Bancolombia). Al aprobarse el pago descargas el
        archivo de inmediato en esta misma página.</small
      >
      @if (error()) {
        <p class="error" role="alert">{{ error() }}</p>
      }
    </div>

    <ul class="cards plantilla-list">
      @for (p of plantillas; track p.id) {
        <li class="card plantilla">
          <img
            class="shot"
            [src]="p.image"
            [alt]="'Vista previa de ' + p.name"
            width="1040"
            height="760"
            loading="lazy"
          />
          <div class="body">
            <h2>{{ p.name }}</h2>
            <p>{{ p.blurb }}</p>
            <p class="price">{{ p.price }}</p>
            <div class="actions">
              <a class="btn btn-ghost" [href]="p.sample" download>Descargar muestra</a>
              <button
                type="button"
                class="btn"
                [disabled]="busy() !== null"
                (click)="buy(p.id)"
                [attr.data-testid]="'buy-' + p.id"
              >
                {{ busy() === p.id ? 'Abriendo Wompi…' : 'Comprar' }}
              </button>
            </div>
          </div>
        </li>
      }
    </ul>

    <section class="card values" aria-labelledby="combo">
      <h2 id="combo">Combo las 3</h2>
      <p>
        Las tres plantillas juntas por <strong>$39.900 COP</strong>. Ideal si manejas un negocio
        pequeño y quieres liquidar, pagar nómina y llevar tu presupuesto.
      </p>
      <button
        type="button"
        class="btn"
        [disabled]="busy() !== null"
        (click)="buy('combo')"
        data-testid="buy-combo"
      >
        {{ busy() === 'combo' ? 'Abriendo Wompi…' : 'Comprar el combo' }}
      </button>
    </section>

    <p class="disclaimer" role="note">
      Las plantillas son una guía de cálculo. No reemplazan asesoría laboral o contable. Hecho por
      JFredDev ·
      <a routerLink="/">Calcula gratis en línea</a>.
    </p>
  `,
  styles: `
    .buyer {
      display: grid;
      gap: 0.4rem;
      margin-bottom: 1.25rem;
    }
    .buyer input {
      font: inherit;
      padding: 0.6rem 0.75rem;
      border: 1px solid var(--line);
      border-radius: 10px;
      max-width: 26rem;
    }
    .buyer small {
      color: var(--muted);
    }
    .error {
      color: var(--neg);
      margin: 0;
    }
    .eyebrow {
      font-size: 0.9rem;
      margin: 0 0 0.5rem;
    }
    .plantilla-list {
      list-style: none;
      padding: 0;
      display: grid;
      gap: 1.25rem;
    }
    .plantilla {
      display: grid;
      gap: 1rem;
      padding: 0;
      overflow: hidden;
    }
    .shot {
      width: 100%;
      height: auto;
      display: block;
      background: #f8fafc;
    }
    .body {
      padding: 0 1.25rem 1.25rem;
    }
    .body h2 {
      margin: 0 0 0.4rem;
      font-size: 1.25rem;
    }
    .price {
      font-weight: 700;
      color: #0f766e;
      margin: 0.75rem 0;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.6rem;
    }
    .btn[disabled] {
      opacity: 0.65;
      cursor: not-allowed;
    }
    @media (min-width: 720px) {
      .plantilla {
        grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
        align-items: center;
      }
      .body {
        padding: 1.25rem 1.25rem 1.25rem 0;
      }
    }
  `,
})
export class Plantillas implements OnInit {
  protected readonly plantillas: Plantilla[] = [
    {
      id: 'liquidacion',
      name: 'Liquidación de contrato 2026',
      blurb:
        'Cesantías, intereses, prima y vacaciones con DÍAS360. Ideal cuando terminas un contrato o liquidas a alguien de tu equipo.',
      price: '$14.900 COP',
      image: 'plantillas/Liquidacion-2026.webp',
      sample: 'plantillas/Cuadre-Liquidacion-2026-MUESTRA.xlsx',
    },
    {
      id: 'nomina',
      name: 'Nómina para pequeño negocio 2026',
      blurb:
        'Hasta 15 empleados: salario, horas extra, auxilio, deducciones, neto a pagar y costo total de la empresa (aportes + provisiones).',
      price: '$29.900 COP',
      image: 'plantillas/Nomina-Pequeno-Negocio-2026.webp',
      sample: 'plantillas/Cuadre-Nomina-Pequeno-Negocio-2026-MUESTRA.xlsx',
    },
    {
      id: 'presupuesto',
      name: 'Presupuesto personal 50/30/20',
      blurb:
        'Ingresos, gastos por categoría y alerta cuando te pasas. Compara tu mes con la regla 50/30/20.',
      price: '$9.900 COP',
      image: 'plantillas/Presupuesto-Personal.webp',
      sample: 'plantillas/Cuadre-Presupuesto-Personal-MUESTRA.xlsx',
    },
  ];

  protected readonly email = signal('');
  protected readonly busy = signal<Sku | null>(null);
  protected readonly error = signal<string | null>(null);

  private readonly seo = inject(SeoService);
  private readonly payments = inject(PaymentsService);

  /** Pide a la API la referencia y la firma (precio fijo en el servidor) y abre el checkout. */
  protected async buy(sku: Sku): Promise<void> {
    this.error.set(null);
    const raw = this.email().trim();
    if (raw && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
      this.error.set('Revisa el correo o déjalo vacío.');
      return;
    }
    this.busy.set(sku);
    try {
      const c = await this.payments.checkout(sku, raw || null);
      try {
        localStorage.setItem(LAST_ORDER_KEY, c.reference);
      } catch {
        /* sin localStorage */
      }
      window.location.assign(this.payments.buildCheckoutUrl(c, raw || null));
    } catch {
      this.error.set('No pudimos abrir el pago. Intenta de nuevo en unos segundos.');
      this.busy.set(null);
    }
  }

  ngOnInit(): void {
    this.seo.set({
      title: 'Plantillas de Excel laborales Colombia 2026',
      description:
        'Plantillas de Excel de Cuadre: liquidación de contrato, nómina para pequeño negocio y presupuesto personal, con valores legales 2026.',
      path: 'plantillas',
    });
  }
}
