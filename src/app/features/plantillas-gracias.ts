import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { LAST_ORDER_KEY, PaymentsService, type OrderStatus } from '../core/payments';
import { SeoService } from '../core/seo.service';

type View = 'loading' | 'pending' | 'paid' | 'declined' | 'expired' | 'missing' | 'error';

/** Cada cuánto se consulta la orden mientras Wompi confirma, y por cuánto tiempo. */
const POLL_MS = 3_000;
const POLL_MAX = 40;

@Component({
  selector: 'app-plantillas-gracias',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="hero">
      <p class="eyebrow"><a routerLink="/plantillas">← Plantillas</a></p>
      <h1>Gracias por tu compra</h1>
    </section>

    <section class="card status" aria-live="polite">
      @switch (view()) {
        @case ('loading') {
          <p>Revisando tu pago…</p>
        }
        @case ('pending') {
          <p>
            Wompi todavía está confirmando el pago. Esta página se actualiza sola; no la cierres.
          </p>
        }
        @case ('paid') {
          <h2>{{ order()?.name }}</h2>
          <p>Pago aprobado. Descarga tus archivos:</p>
          <ul class="downloads">
            @for (d of order()?.downloads ?? []; track d.name) {
              <li>
                <a class="btn" [href]="d.url" download>Descargar {{ d.name }}</a>
              </li>
            }
          </ul>
          <small
            >Los enlaces vencen en 30 minutos. Si se vencen, vuelve a abrir esta página y se generan
            otros (durante 7 días). Referencia: {{ order()?.reference }}</small
          >
        }
        @case ('declined') {
          <p>El pago no se aprobó. No se hizo ningún cobro por esta compra.</p>
          <a class="btn" routerLink="/plantillas">Intentar de nuevo</a>
        }
        @case ('expired') {
          <p>
            La ventana de descarga de esta compra ya venció. Escríbenos con la referencia
            {{ order()?.reference }} y te ayudamos.
          </p>
        }
        @case ('missing') {
          <p>No encontramos una compra para mostrar.</p>
          <a class="btn" routerLink="/plantillas">Ver plantillas</a>
        }
        @default {
          <p>
            No pudimos consultar el pago. Recarga la página en un momento
            @if (ref) {
              (referencia {{ ref }})
            }
            .
          </p>
        }
      }
    </section>

    <p class="disclaimer" role="note">
      Pagos procesados por Wompi (Bancolombia). Hecho por JFredDev.
    </p>
  `,
  styles: `
    .eyebrow {
      font-size: 0.9rem;
      margin: 0 0 0.5rem;
    }
    .status {
      display: grid;
      gap: 0.75rem;
    }
    .downloads {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      gap: 0.5rem;
    }
    small {
      color: var(--muted);
    }
  `,
})
export class PlantillasGracias implements OnInit {
  protected readonly view = signal<View>('loading');
  protected readonly order = signal<OrderStatus | null>(null);
  protected ref: string | null = null;

  private readonly seo = inject(SeoService);
  private readonly meta = inject(Meta);
  private readonly payments = inject(PaymentsService);
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.timer && clearTimeout(this.timer));
    // Solo en el navegador: el prerender deja el estado "Revisando tu pago…".
    afterNextRender(() => this.start());
  }

  ngOnInit(): void {
    this.seo.set({
      title: 'Gracias por tu compra',
      description: 'Descarga de las plantillas de Excel de Cuadre después del pago con Wompi.',
      path: 'plantillas/gracias',
    });
    this.meta.updateTag({ name: 'robots', content: 'noindex' });
  }

  private start(): void {
    const q = new URLSearchParams(window.location.search);
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(LAST_ORDER_KEY);
    } catch {
      /* sin localStorage */
    }
    this.ref = q.get('ref') ?? stored;
    if (!this.ref) {
      this.view.set('missing');
      return;
    }
    void this.poll(q.get('id'), 0);
  }

  private async poll(transactionId: string | null, attempt: number): Promise<void> {
    try {
      const o = await this.payments.order(this.ref!, transactionId);
      this.order.set(o);
      if (o.status === 'PAID') return this.view.set('paid');
      if (o.status === 'DECLINED') return this.view.set('declined');
      if (o.status === 'EXPIRED') return this.view.set('expired');
      this.view.set('pending');
    } catch (e) {
      if ((e as Error).message === 'HTTP 404') return this.view.set('missing');
      if (attempt > 3) return this.view.set('error');
    }
    if (attempt < POLL_MAX)
      this.timer = setTimeout(() => void this.poll(transactionId, attempt + 1), POLL_MS);
    else this.view.set('error');
  }
}
