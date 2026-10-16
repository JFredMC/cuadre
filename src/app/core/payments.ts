import { Injectable } from '@angular/core';

/**
 * Pagos de plantillas con Wompi Web Checkout. La API de Ñapa fija el precio, firma el pago,
 * recibe el evento de Wompi y entrega enlaces de descarga firmados y de corta vida.
 */
export const PAYMENTS = {
  /** Llave pública de Wompi (es pública: va en el front). Para sandbox, cambiar por pub_test_…. */
  wompiPublicKey: 'pub_prod_l8v3aNkH3MvmxovBogKpvspBNt8RK4wY',
  apiUrl: 'https://napa-api.onrender.com/api',
  checkoutUrl: 'https://checkout.wompi.co/p/',
};

/** Para probar en sandbox sin desplegar: localStorage['cuadre.wompiKey'] = 'pub_test_…'. */
export function wompiPublicKey(): string {
  try {
    const override = globalThis.localStorage?.getItem('cuadre.wompiKey');
    if (override && /^pub_test_\w+$/.test(override)) return override;
  } catch {
    /* sin localStorage */
  }
  return PAYMENTS.wompiPublicKey;
}

export type Sku = 'liquidacion' | 'nomina' | 'presupuesto' | 'combo';

export interface CheckoutResponse {
  reference: string;
  amountInCents: number;
  currency: 'COP';
  signature: string;
  redirectUrl: string;
}

export interface OrderDownload {
  name: string;
  url: string;
  expiresAt: string;
}

export interface OrderStatus {
  reference: string;
  sku: Sku;
  name: string;
  status: 'PENDING' | 'PAID' | 'DECLINED' | 'EXPIRED';
  downloads: OrderDownload[];
}

export const LAST_ORDER_KEY = 'cuadre.lastOrder';

@Injectable({ providedIn: 'root' })
export class PaymentsService {
  /** Render (plan gratuito) puede tardar en despertar. */
  timeoutMs = 30_000;

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), this.timeoutMs);
    try {
      const res = await fetch(PAYMENTS.apiUrl + path, { ...init, signal: ctrl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as T;
    } finally {
      clearTimeout(timer);
    }
  }

  checkout(sku: Sku, email: string | null): Promise<CheckoutResponse> {
    return this.request('/plantillas/checkout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(email ? { sku, email } : { sku }),
    });
  }

  order(reference: string, transactionId?: string | null): Promise<OrderStatus> {
    const q = transactionId ? `?id=${encodeURIComponent(transactionId)}` : '';
    return this.request(`/plantillas/order/${encodeURIComponent(reference)}${q}`);
  }

  buildCheckoutUrl(c: CheckoutResponse, email: string | null): string {
    const params: [string, string][] = [
      ['public-key', wompiPublicKey()],
      ['currency', c.currency],
      ['amount-in-cents', String(c.amountInCents)],
      ['reference', c.reference],
      ['signature:integrity', c.signature],
      ['redirect-url', `${c.redirectUrl}?ref=${encodeURIComponent(c.reference)}`],
    ];
    if (email) params.push(['customer-data:email', email]);
    return `${PAYMENTS.checkoutUrl}?${params.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')}`;
  }
}
