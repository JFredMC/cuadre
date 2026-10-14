import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { formatCop } from '../core/calc';

export interface ResultRow {
  label: string;
  value: number;
  detail?: string;
  negative?: boolean;
  /** Muestra este texto en lugar de un valor en pesos. */
  text?: string;
}

@Component({
  selector: 'app-result-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="result" aria-live="polite">
      <p class="total-label">{{ totalLabel() }}</p>
      <p class="total" data-testid="total">{{ cop(total()) }}</p>
      <dl>
        @for (r of rows(); track r.label) {
          <div class="row">
            <dt>
              {{ r.label }}
              @if (r.detail) {
                <small>{{ r.detail }}</small>
              }
            </dt>
            <dd [class.neg]="r.negative">
              {{ r.text ?? (r.negative ? '− ' : '') + cop(r.value) }}
            </dd>
          </div>
        }
      </dl>
      <ng-content />
    </section>
  `,
})
export class ResultTable {
  readonly totalLabel = input.required<string>();
  readonly total = input.required<number>();
  readonly rows = input.required<ResultRow[]>();
  protected readonly cop = formatCop;
}
