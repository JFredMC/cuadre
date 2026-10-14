import { DestroyRef, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SITE_URL } from '../core/site';

/** Lee los datos del enlace compartido (?salario=...) y arma el enlace para compartir. */
export function urlState(slug: string) {
  const route = inject(ActivatedRoute);
  const browser = isPlatformBrowser(inject(PLATFORM_ID));
  inject(DestroyRef);
  return {
    read(apply: (get: (key: string) => string | null) => void): void {
      if (!browser) return;
      const params = route.snapshot.queryParamMap;
      if (params.keys.length) apply((k) => params.get(k));
    },
    link(params: Record<string, string | number>): string {
      const qs = new URLSearchParams(
        Object.entries(params).map(([k, v]) => [k, String(v)]),
      ).toString();
      return `${SITE_URL}${slug}/${qs ? '?' + qs : ''}`;
    },
  };
}

export const num = (v: string | null, fallback: number) => {
  const n = Number(v);
  return v !== null && Number.isFinite(n) && n >= 0 ? n : fallback;
};
export const isoOr = (v: string | null, fallback: string) =>
  v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : fallback;
