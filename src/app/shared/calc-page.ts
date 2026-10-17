import { ChangeDetectionStrategy, Component, OnInit, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { VALUES_UPDATED_AT } from '../core/calc';
import { CALCULATORS, CalcPageMeta, longDate } from '../core/site';
import { SeoService } from '../core/seo.service';
import { AdSlot } from './ad-slot';

/** Estructura común de cada calculadora: SEO, fuentes, aviso legal, FAQ y anuncios. */
@Component({
  selector: 'app-calc-page',
  imports: [RouterLink, AdSlot],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="calc">
      <header class="calc-head">
        <h1>{{ page().h1 }}</h1>
        <p class="lead">{{ page().intro }}</p>
      </header>

      <div class="workbench">
        <div class="workbench-form">
          <ng-content select="[calcForm]" />
        </div>
        <div class="workbench-result">
          <ng-content select="[calcResult]" />
        </div>
      </div>

      <div class="calc-reading">
        <p class="disclaimer" role="note">
          Los resultados son aproximados y no constituyen asesoría legal ni contable. Verifica tu
          caso con tu empleador, un contador o el Ministerio del Trabajo.
        </p>

        <app-ad-slot />

        <section class="sources" aria-labelledby="fuentes">
          <h2 id="fuentes">Fuente</h2>
          <ul>
            @for (s of page().sources; track s.id) {
              <li>
                <a [href]="s.url" target="_blank" rel="noopener noreferrer">{{ s.label }}</a>
              </li>
            }
          </ul>
          <p class="updated">Valores actualizados a {{ updated }}.</p>
        </section>

        <section class="faq" aria-labelledby="faq">
          <h2 id="faq">Preguntas frecuentes</h2>
          @for (f of page().faq; track f.q) {
            <details>
              <summary>{{ f.q }}</summary>
              <p>{{ f.a }}</p>
            </details>
          }
        </section>

        <nav class="more" aria-label="Otras calculadoras">
          <h2>Otras calculadoras</h2>
          <ul class="chips">
            @for (c of others(); track c.slug) {
              <li>
                <a [routerLink]="['/', c.slug]">{{ c.icon }} {{ c.name }}</a>
              </li>
            }
          </ul>
        </nav>
      </div>
    </article>
  `,
  styles: `
    .calc-head {
      max-width: 48rem;
    }
    .workbench {
      display: grid;
      gap: 0;
    }
    .calc-reading {
      max-width: 760px;
    }
    @media (min-width: 1024px) {
      .workbench {
        grid-template-columns: minmax(0, 1fr) minmax(340px, 430px);
        gap: 1.25rem;
        align-items: start;
      }
      .workbench-result {
        position: sticky;
        top: 6rem;
      }
    }
  `,
})
export class CalcPage implements OnInit {
  readonly page = input.required<CalcPageMeta>();
  protected readonly updated = longDate(VALUES_UPDATED_AT);
  private readonly seo = inject(SeoService);

  protected others() {
    return CALCULATORS.filter((c) => c.slug !== this.page().slug);
  }

  ngOnInit(): void {
    const p = this.page();
    this.seo.set({ title: p.title, description: p.description, path: p.slug, faq: p.faq });
  }
}
