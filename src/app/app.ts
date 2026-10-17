import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { CALCULATORS, NAPA_URL, PORTFOLIO_URL } from './core/site';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly router = inject(Router);
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      startWith(null),
      map(() => this.router.url.split(/[?#]/)[0]),
    ),
    { initialValue: this.router.url.split(/[?#]/)[0] },
  );
  /** Inicio y /plantillas usan el ancho amplio; calculadoras y páginas de lectura, el estrecho. */
  protected readonly narrow = computed(() => {
    const path = (this.url() ?? '/').replace(/^\/+|\/+$/g, '');
    return path !== '' && path !== 'plantillas';
  });
  protected readonly calculators = CALCULATORS;
  protected readonly napa = NAPA_URL;
  protected readonly portfolio = PORTFOLIO_URL;
}
