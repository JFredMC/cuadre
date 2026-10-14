import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

/** Compartir el resultado por WhatsApp o copiar el enlace con los datos. */
@Component({
  selector: 'app-share-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="share">
      <a class="btn btn-wa" [href]="waHref()" target="_blank" rel="noopener noreferrer">
        Compartir por WhatsApp
      </a>
      <button type="button" class="btn btn-ghost" (click)="copy()">
        {{ copied() ? '¡Enlace copiado!' : 'Copiar enlace' }}
      </button>
    </div>
  `,
})
export class ShareBar {
  readonly text = input.required<string>();
  readonly url = input.required<string>();
  protected readonly copied = signal(false);
  protected readonly waHref = computed(
    () => 'https://wa.me/?text=' + encodeURIComponent(`${this.text()}\n${this.url()}`),
  );

  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.url());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } catch {
      /* el navegador no permite copiar */
    }
  }
}
