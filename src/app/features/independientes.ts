import { ChangeDetectionStrategy, Component, OnInit, computed, signal } from '@angular/core';
import { ARL_RATES, RiskClass, formatCop, independiente } from '../core/calc';
import { calculator } from '../core/site';
import { CalcPage } from '../shared/calc-page';
import { MoneyInput } from '../shared/money-input';
import { ResultRow, ResultTable } from '../shared/result-table';
import { ShareBar } from '../shared/share-bar';
import { num, urlState } from '../shared/url-state';

@Component({
  selector: 'app-independientes',
  imports: [CalcPage, MoneyInput, ResultTable, ShareBar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-calc-page [page]="page">
      <form calcForm class="card form" (submit)="$event.preventDefault()">
        <app-money-input
          label="Ingreso mensual (sin IVA)"
          name="ingreso"
          hint="Honorarios o ingresos del mes."
          [(value)]="income"
        />
        <label class="field">
          <span>Riesgo ARL</span>
          <select name="arl" [value]="risk()" (change)="setRisk($event)">
            <option value="0">Sin ARL</option>
            @for (c of classes; track c) {
              <option [value]="c">Clase {{ c }} ({{ arlPct(c) }})</option>
            }
          </select>
          <small
            >Si tienes contrato de prestación de servicios, la ARL es obligatoria. En riesgo IV y V
            la paga el contratante.</small
          >
        </label>
      </form>
      <app-result-table
        calcResult
        totalLabel="Pagas al mes en la PILA"
        [total]="r().total"
        [rows]="rows()"
      >
        @if (!r().required) {
          <p class="note">
            Con ingresos menores a un salario mínimo no estás obligado a cotizar como independiente.
            Si cotizas de forma voluntaria, el IBC mínimo es un salario mínimo.
          </p>
        }
        <app-share-bar [text]="shareText()" [url]="shareUrl()" />
      </app-result-table>
    </app-calc-page>
  `,
})
export class Independientes implements OnInit {
  protected readonly page = calculator('seguridad-social-independientes');
  protected readonly classes = [1, 2, 3, 4, 5] as const;
  protected readonly income = signal(5_000_000);
  protected readonly risk = signal<RiskClass>(1);
  private readonly state = urlState('seguridad-social-independientes');
  protected readonly r = computed(() => independiente(this.income(), this.risk()));
  protected readonly rows = computed<ResultRow[]>(() => {
    const r = this.r();
    const rows: ResultRow[] = [
      {
        label: 'IBC (40% del ingreso)',
        value: r.ibc,
        detail: 'Mínimo 1 y máximo 25 salarios mínimos',
      },
      { label: 'Salud (12,5%)', value: r.salud },
      { label: 'Pensión (16%)', value: r.pension },
    ];
    if (r.solidaridad)
      rows.push({
        label: `Fondo de solidaridad (${(r.solidarityRate * 100).toFixed(1).replace('.', ',')}%)`,
        value: r.solidaridad,
      });
    if (r.arl) rows.push({ label: `ARL (${this.arlPct(this.risk() as 1)})`, value: r.arl });
    return rows;
  });
  protected readonly shareUrl = computed(() =>
    this.state.link({ ingreso: this.income(), arl: this.risk() }),
  );
  protected readonly shareText = computed(
    () =>
      `Como independiente pago ${formatCop(this.r().total)} de seguridad social al mes. Calcula lo tuyo en Cuadre:`,
  );

  ngOnInit(): void {
    this.state.read((get) => {
      this.income.set(num(get('ingreso'), this.income()));
      const a = num(get('arl'), this.risk());
      if (a >= 0 && a <= 5) this.risk.set(Math.round(a) as RiskClass);
    });
  }

  protected arlPct(c: 1 | 2 | 3 | 4 | 5): string {
    return `${(ARL_RATES[c] * 100).toFixed(3).replace('.', ',')}%`;
  }

  protected setRisk(e: Event): void {
    this.risk.set(Number((e.target as HTMLSelectElement).value) as RiskClass);
  }
}
