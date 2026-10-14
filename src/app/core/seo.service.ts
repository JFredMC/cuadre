import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Faq, SITE_NAME, SITE_URL } from './site';

export interface SeoData {
  title: string;
  description: string;
  /** Ruta relativa al sitio, sin barra inicial ('' para el inicio). */
  path: string;
  faq?: Faq[];
}

/** Título, descripción, canonical, Open Graph y JSON-LD; corre también en el prerender. */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  set(data: SeoData): void {
    const url = SITE_URL + (data.path ? data.path + '/' : '');
    const fullTitle = data.path ? `${data.title} | ${SITE_NAME}` : data.title;
    this.title.setTitle(fullTitle);
    this.meta.updateTag({ name: 'description', content: data.description });
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: data.description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:locale', content: 'es_CO' });
    this.meta.updateTag({ property: 'og:site_name', content: SITE_NAME });
    this.meta.updateTag({ property: 'og:image', content: SITE_URL + 'og.png' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });

    let link = this.doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.rel = 'canonical';
      this.doc.head.appendChild(link);
    }
    link.href = url;

    this.doc.head.querySelectorAll('script[data-seo]').forEach((s) => s.remove());
    const graph: object[] = [
      {
        '@type': 'WebApplication',
        name: fullTitle,
        url,
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        inLanguage: 'es-CO',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'COP' },
      },
    ];
    if (data.faq?.length) {
      graph.push({
        '@type': 'FAQPage',
        mainEntity: data.faq.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      });
    }
    const script = this.doc.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo', '');
    script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
    this.doc.head.appendChild(script);
  }
}
