import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { CALCULATORS, NAPA_URL, PORTFOLIO_URL } from './core/site';

export const THEME_KEY = 'cuadre.theme';
type Theme = 'light' | 'dark';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
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

  protected readonly menuOpen = signal(false);
  protected readonly theme = signal<Theme>('light');
  protected readonly scrolled = signal(false);
  private readonly menuButton = viewChild<ElementRef<HTMLButtonElement>>('menuButton');
  private scrollHandler: (() => void) | null = null;

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.menuOpen.set(false));

    // Solo en el navegador: tema guardado o del sistema, y sombra de cabecera al hacer scroll.
    afterNextRender(() => {
      const stored = this.storedTheme();
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      this.theme.set(stored ?? (media.matches ? 'dark' : 'light'));
      media.addEventListener?.('change', (e) => {
        if (!this.storedTheme()) this.theme.set(e.matches ? 'dark' : 'light');
      });
      const onScroll = () => this.scrolled.set(window.scrollY > 8);
      this.scrollHandler = onScroll;
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    });
    this.destroyRef.onDestroy(() => {
      if (this.scrollHandler) window.removeEventListener('scroll', this.scrollHandler);
    });
  }

  private storedTheme(): Theme | null {
    try {
      const t = localStorage.getItem(THEME_KEY);
      return t === 'dark' || t === 'light' ? t : null;
    } catch {
      return null;
    }
  }

  protected toggleTheme(): void {
    const next: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    document.documentElement.dataset['theme'] = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* sin localStorage */
    }
  }

  protected toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (!this.menuOpen()) return;
    this.closeMenu();
    this.menuButton()?.nativeElement.focus();
  }
}
