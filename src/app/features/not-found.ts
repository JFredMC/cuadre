import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { SeoService } from '../core/seo.service';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="hero">
      <h1>Página no encontrada</h1>
      <p class="lead">
        Esa calculadora no existe. <a routerLink="/">Ver todas las calculadoras</a>.
      </p>
    </section>
  `,
})
export class NotFound implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly meta = inject(Meta);
  ngOnInit(): void {
    this.seo.set({
      title: 'Página no encontrada',
      description: 'Página no encontrada.',
      path: '404',
    });
    this.meta.updateTag({ name: 'robots', content: 'noindex' });
  }
}
