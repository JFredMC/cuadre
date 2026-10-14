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
import { DocFormat, ResultDoc, buildResultDoc, docFileName, readInputs } from './result-docs';
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
      <details class="dl-menu" #menu>
        <summary class="btn btn-ghost" aria-label="Descargar el resultado">Descargar</summary>
        <div class="dl-list">
          <button
            type="button"
            data-testid="download-card"
            aria-label="Descargar imagen del resultado"
            (click)="download(); menu.open = false"
          >
            Imagen (PNG)
          </button>
          @for (f of formats; track f.id) {
            <button
              type="button"
              [attr.data-testid]="'download-' + f.id"
              [attr.aria-label]="'Descargar el resultado en ' + f.name"
              (click)="downloadDoc(f.id); menu.open = false"
            >
              {{ f.name }}
            </button>
          }
        </div>
      </details>
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
  protected readonly formats: { id: DocFormat; name: string }[] = [
    { id: 'pdf', name: 'PDF' },
    { id: 'xlsx', name: 'Excel (.xlsx)' },
    { id: 'docx', name: 'Word (.docx)' },
  ];
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

  /** Datos completos para PDF, Excel y Word. */
  docData(): ResultDoc | null {
    const card = this.cardData();
    if (!card) return null;
    const el = this.host.nativeElement as HTMLElement;
    const root = el.closest('.calc') ?? this.doc;
    return {
      ...card,
      generatedAt: new Date(),
      inputs: readInputs(root.querySelector('form')),
      disclaimer:
        root.querySelector('.disclaimer')?.textContent?.replace(/\s+/g, ' ').trim() ??
        'Los resultados son aproximados y no constituyen asesoría legal ni contable.',
      url: this.url(),
    };
  }

  async downloadDoc(fmt: DocFormat): Promise<void> {
    const data = this.docData();
    if (!data) return;
    const blob = await buildResultDoc(data, fmt);
    this.save(blob, docFileName(data.title, fmt));
  }

  async download(): Promise<void> {
    const file = await this.makeFile();
    if (file) this.save(file, file.name);
  }

  private save(blob: Blob, name: string): void {
    const href = URL.createObjectURL(blob);
    const a = this.doc.createElement('a');
    a.href = href;
    a.download = name;
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
