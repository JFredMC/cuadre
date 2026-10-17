import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  AUXILIO_TRANSPORTE_2026,
  SMMLV_2026,
  SOURCES,
  UVT_2026,
  VALUES_UPDATED_AT,
  formatCop,
} from '../core/calc';
import { SeoService } from '../core/seo.service';
import { CALCULATORS, longDate } from '../core/site';
import { AdSlot } from '../shared/ad-slot';

@Component({
  selector: 'app-home',
  imports: [RouterLink, AdSlot],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .cards li,
    .link-card {
      height: 100%;
    }
    /* Separación entre los bloques finales y con el aviso/pie que sigue. */
    .values {
      margin-bottom: 1rem;
    }
    @media (min-width: 1024px) {
      .hero {
        max-width: 48rem;
      }
      /* Mismo ancho que las tarjetas de arriba; los datos se reparten en columnas. */
      .values dl {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0 2rem;
      }
      .values .updated {
        max-width: 60rem;
      }
      .promo p {
        max-width: 48rem;
      }
      .values {
        margin-bottom: 1.5rem;
      }
    }
  `,
  template: `
    <section class="hero">
      <h1>Calculadoras laborales para Colombia 2026</h1>
      <p class="lead">
        Liquidación, salario neto, prima, intereses de cesantías, horas extras y aportes de
        independientes. Gratis, rápido y con las normas citadas.
      </p>
    </section>
    <ul class="cards">
      @for (c of calculators; track c.slug) {
        <li>
          <a class="card link-card" [routerLink]="['/', c.slug]">
            <span class="icon" aria-hidden="true">{{ c.icon }}</span>
            <span>
              <strong>{{ c.name }}</strong>
              <small>{{ c.description }}</small>
            </span>
          </a>
        </li>
      }
    </ul>
    <app-ad-slot />
    <section class="card values" aria-labelledby="valores">
      <h2 id="valores">Valores 2026</h2>
      <dl>
        <div class="row">
          <dt>Salario mínimo (SMMLV)</dt>
          <dd>{{ cop(smmlv) }}</dd>
        </div>
        <div class="row">
          <dt>Auxilio de transporte</dt>
          <dd>{{ cop(aux) }}</dd>
        </div>
        <div class="row">
          <dt>UVT</dt>
          <dd>{{ cop(uvt) }}</dd>
        </div>
        <div class="row">
          <dt>Jornada máxima desde el 15-jul-2026</dt>
          <dd>42 h/semana</dd>
        </div>
        <div class="row">
          <dt>Recargo dominical desde el 1-jul-2026</dt>
          <dd>90%</dd>
        </div>
      </dl>
      <p class="updated">
        Fuente:
        @for (s of sources; track s.id; let last = $last) {
          <a [href]="s.url" target="_blank" rel="noopener noreferrer">{{ s.label }}</a
          >{{ last ? '.' : ' · ' }}
        }
        Valores actualizados a {{ updated }}.
      </p>
    </section>
    <section class="card values promo" aria-labelledby="plantillas">
      <h2 id="plantillas">Plantillas de Excel</h2>
      <p>
        ¿Necesitas liquidar a varios o llevar la nómina de tu negocio? Las mismas fórmulas, en
        Excel, listas para descargar.
      </p>
      <p><a class="btn" routerLink="/plantillas">Ver plantillas</a></p>
    </section>
    <p class="disclaimer" role="note">
      Los resultados son aproximados y no constituyen asesoría legal ni contable.
    </p>
  `,
})
export class Home implements OnInit {
  protected readonly calculators = CALCULATORS;
  protected readonly cop = formatCop;
  protected readonly smmlv = SMMLV_2026;
  protected readonly aux = AUXILIO_TRANSPORTE_2026;
  protected readonly uvt = UVT_2026;
  protected readonly sources = [
    SOURCES.smmlv,
    SOURCES.auxilio,
    SOURCES.uvt,
    SOURCES.jornada,
    SOURCES.reforma,
  ];
  protected readonly updated = longDate(VALUES_UPDATED_AT);
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.set({
      title: 'Cuadre: calculadoras laborales Colombia 2026 (liquidación, prima, horas extras)',
      description:
        'Calculadoras gratis de liquidación laboral, salario neto, prima, intereses de cesantías, horas extras y seguridad social para independientes en Colombia, con valores 2026.',
      path: '',
    });
  }
}
