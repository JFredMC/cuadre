import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ADSENSE_CLIENT, ADSENSE_SLOT } from '../core/ads-config';

/** Espacio para AdSense. No renderiza nada si ADSENSE_CLIENT no está configurado. */
@Component({
  selector: 'app-ad-slot',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (client) {
      <aside class="ad" aria-label="Publicidad">
        <ins
          class="adsbygoogle"
          style="display:block"
          [attr.data-ad-client]="client"
          [attr.data-ad-slot]="slot || null"
          data-ad-format="auto"
          data-full-width-responsive="true"
        ></ins>
      </aside>
    }
  `,
})
export class AdSlot implements AfterViewInit {
  protected readonly client = ADSENSE_CLIENT;
  protected readonly slot = ADSENSE_SLOT;
  private readonly doc = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  ngAfterViewInit(): void {
    if (!this.client || !this.browser) return;
    if (!this.doc.querySelector('script[data-adsense]')) {
      const s = this.doc.createElement('script');
      s.async = true;
      s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${this.client}`;
      s.crossOrigin = 'anonymous';
      s.setAttribute('data-adsense', '');
      this.doc.head.appendChild(s);
    }
    const w = this.doc.defaultView as (Window & { adsbygoogle?: unknown[] }) | null;
    if (w) (w.adsbygoogle = w.adsbygoogle ?? []).push({});
  }
}
