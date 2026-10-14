import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ResultTable } from './result-table';
import { ShareCardData, canShareFiles, shareCardPng, shareFileName } from './share-card';

/** Compartir el resultado (imagen + texto) por WhatsApp, descargar la imagen o copiar el enlace. */
@Component({
  selector: 'app-share-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="share">
      <a
        class="btn btn-wa"
        [href]="waHref()"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Compartir por WhatsApp la imagen del resultado y el texto"
        (click)="shareImage($event)"
      >
        Compartir por WhatsApp
      </a>
      <button
        type="button"
        class="btn btn-ghost"
        data-testid="download-card"
        aria-label="Descargar imagen del resultado"
        (click)="download()"
      >
        Descargar imagen
      </button>
      <button type="button" class="btn btn-ghost" (click)="copy()">
        {{ copied() ? '¡Enlace copiado!' : 'Copiar enlace' }}
      </button>
    </div>
  `,
})
export class ShareBar {
  readonly text = input.required<string>();
  readonly url = input.required<string>();
  private readonly table = inject(ResultTable, { optional: true });
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly doc = inject(DOCUMENT);
  protected readonly copied = signal(false);
  protected readonly message = computed(() => `${this.text()}\n${this.url()}`);
  protected readonly waHref = computed(
    () => 'https://wa.me/?text=' + encodeURIComponent(this.message()),
  );

  /** Datos de la tarjeta a dibujar, tomados de la tabla de resultados que la contiene. */
  cardData(): ShareCardData | null {
    if (!this.table) return null;
    const el = this.host.nativeElement as HTMLElement;
    const note = el
      .closest('.result')
      ?.querySelector('.note')
      ?.textContent?.replace(/\s+/g, ' ')
      .trim();
    const title = this.doc.querySelector('h1')?.textContent?.trim() ?? 'Resultado';
    return {
      title,
      totalLabel: this.table.totalLabel(),
      total: this.table.total(),
      rows: this.table.rows(),
      note: note || undefined,
    };
  }

  async makeFile(): Promise<File | null> {
    const data = this.cardData();
    if (!data) return null;
    const blob = await shareCardPng(data, this.doc);
    return new File([blob], shareFileName(data.title), { type: 'image/png' });
  }

  /** En móviles comparte imagen + texto con el menú nativo; si no se puede, sigue el enlace wa.me. */
  async shareImage(ev: Event): Promise<void> {
    const nav = this.doc.defaultView?.navigator;
    if (!nav || typeof nav.canShare !== 'function' || typeof nav.share !== 'function') return;
    ev.preventDefault();
    try {
      const file = await this.makeFile();
      if (file && canShareFiles(nav, file)) {
        await nav.share({ files: [file], text: this.message() });
        return;
      }
    } catch (e) {
      if ((e as DOMException)?.name === 'AbortError') return;
    }
    this.doc.defaultView?.open(this.waHref(), '_blank', 'noopener,noreferrer');
  }

  async download(): Promise<void> {
    const file = await this.makeFile();
    if (!file) return;
    const href = URL.createObjectURL(file);
    const a = this.doc.createElement('a');
    a.href = href;
    a.download = file.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  }

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
