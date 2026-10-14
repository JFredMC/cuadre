import { ChangeDetectionStrategy, Component, OnInit, computed, signal } from '@angular/core';
import { formatCop, interesesCesantias, roundPeso } from '../core/calc';
import { calculator } from '../core/site';
import { CalcPage } from '../shared/calc-page';
import { MoneyInput } from '../shared/money-input';
import { ResultRow, ResultTable } from '../shared/result-table';
import { ShareBar } from '../shared/share-bar';
import { num, urlState } from '../shared/url-state';

@Component({
  selector: 'app-intereses',
  imports: [CalcPage, MoneyInput, ResultTable, ShareBar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-calc-page [page]="page">
      <form class="card form" (submit)="$event.preventDefault()">
        <app-money-input label="Valor de tus cesantías" name="cesantias" [(value)]="cesantias" />
        <label class="field">
          <span>Días trabajados en el año (máximo 360)</span>
          <input
            type="number"
            inputmode="numeric"
            min="1"
            max="360"
            name="dias"
            [value]="days()"
            (input)="setDays($event)"
          />
        </label>
      </form>
      <app-result-table totalLabel="Intereses de cesantías" [total]="value()" [rows]="rows()">
        <p class="note">
          Si te los pagan tarde, el empleador debe pagarte el doble (Ley 52 de 1975).
        </p>
        <app-share-bar [text]="shareText()" [url]="shareUrl()" />
      </app-result-table>
    </app-calc-page>
  `,
})
export class Intereses implements OnInit {
  protected readonly page = calculator('intereses-cesantias');
  protected readonly cesantias = signal(2_000_000);
  protected readonly days = signal(360);
  private readonly state = urlState('intereses-cesantias');
  protected readonly value = computed(() =>
    roundPeso(interesesCesantias(this.cesantias(), this.days())),
  );
  protected readonly rows = computed<ResultRow[]>(() => [
    { label: 'Cesantías', value: this.cesantias() },
    {
      label: 'Intereses',
      value: this.value(),
      detail: `${((12 * this.days()) / 360).toFixed(2).replace('.', ',')}% por ${this.days()} días`,
    },
  ]);
  protected readonly shareUrl = computed(() =>
    this.state.link({ cesantias: this.cesantias(), dias: this.days() }),
  );
  protected readonly shareText = computed(
    () => `Mis intereses de cesantías: ${formatCop(this.value())}. Calcula los tuyos en Cuadre:`,
  );

  ngOnInit(): void {
    this.state.read((get) => {
      this.cesantias.set(num(get('cesantias'), this.cesantias()));
      this.days.set(Math.min(360, num(get('dias'), 360)));
    });
  }

  protected setDays(e: Event): void {
    const n = Math.round(+(e.target as HTMLInputElement).value || 0);
    this.days.set(Math.min(360, Math.max(0, n)));
  }
}
