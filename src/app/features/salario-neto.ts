import { ChangeDetectionStrategy, Component, OnInit, computed, signal } from '@angular/core';
import { SMMLV_2026, formatCop, salarioNeto } from '../core/calc';
import { calculator } from '../core/site';
import { CalcPage } from '../shared/calc-page';
import { MoneyInput } from '../shared/money-input';
import { ResultRow, ResultTable } from '../shared/result-table';
import { ShareBar } from '../shared/share-bar';
import { num, urlState } from '../shared/url-state';

@Component({
  selector: 'app-salario-neto',
  imports: [CalcPage, MoneyInput, ResultTable, ShareBar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-calc-page [page]="page">
      <form class="card form" (submit)="$event.preventDefault()">
        <app-money-input label="Salario mensual" name="salario" [(value)]="salary" />
        <app-money-input
          label="Otros pagos salariales del mes (opcional)"
          name="otros"
          hint="Horas extras, recargos o comisiones."
          [(value)]="other"
        />
      </form>
      <app-result-table totalLabel="Recibes al mes" [total]="r().net" [rows]="rows()">
        @if (r().incomeInUvt > 95) {
          <p class="note">
            Tu ingreso supera 95 UVT, así que es probable que te apliquen retención en la fuente,
            que esta calculadora no incluye.
          </p>
        }
        <app-share-bar [text]="shareText()" [url]="shareUrl()" />
      </app-result-table>
    </app-calc-page>
  `,
})
export class SalarioNeto implements OnInit {
  protected readonly page = calculator('salario-neto');
  protected readonly salary = signal(SMMLV_2026);
  protected readonly other = signal(0);
  private readonly state = urlState('salario-neto');
  protected readonly r = computed(() => salarioNeto(this.salary(), this.other()));
  protected readonly rows = computed<ResultRow[]>(() => {
    const r = this.r();
    const rows: ResultRow[] = [
      { label: 'Salario devengado', value: r.salary },
      {
        label: 'Auxilio de transporte',
        value: r.allowance,
        detail: r.allowance ? 'Ganas hasta 2 SMMLV' : 'No aplica',
      },
      { label: 'Salud (4%)', value: r.salud, negative: true },
      { label: 'Pensión (4%)', value: r.pension, negative: true },
    ];
    if (r.solidaridad)
      rows.push({
        label: `Fondo de solidaridad (${(r.solidarityRate * 100).toFixed(1).replace('.', ',')}%)`,
        value: r.solidaridad,
        negative: true,
      });
    return rows;
  });
  protected readonly shareUrl = computed(() =>
    this.state.link({ salario: this.salary(), otros: this.other() }),
  );
  protected readonly shareText = computed(
    () =>
      `Con un salario de ${formatCop(this.r().salary)} recibo ${formatCop(this.r().net)} al mes. Calcula el tuyo en Cuadre:`,
  );

  ngOnInit(): void {
    this.state.read((get) => {
      this.salary.set(num(get('salario'), this.salary()));
      this.other.set(num(get('otros'), 0));
    });
  }
}
