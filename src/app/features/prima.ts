import { ChangeDetectionStrategy, Component, OnInit, computed, signal } from '@angular/core';
import {
  SMMLV_2026,
  benefitsBase,
  days360,
  formatCop,
  hasTransportAllowance,
  maxIso,
  prima,
  roundPeso,
} from '../core/calc';
import { calculator } from '../core/site';
import { CalcPage } from '../shared/calc-page';
import { MoneyInput } from '../shared/money-input';
import { ResultRow, ResultTable } from '../shared/result-table';
import { ShareBar } from '../shared/share-bar';
import { isoOr, num, urlState } from '../shared/url-state';

@Component({
  selector: 'app-prima',
  imports: [CalcPage, MoneyInput, ResultTable, ShareBar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-calc-page [page]="page">
      <form calcForm class="card form" (submit)="$event.preventDefault()">
        <app-money-input label="Salario mensual" name="salario" [(value)]="salary" />
        <label class="field">
          <span>Semestre</span>
          <select name="semestre" [value]="semester()" (change)="semester.set(val($event))">
            <option value="2026-1">Primer semestre 2026 (pago en junio)</option>
            <option value="2026-2">Segundo semestre 2026 (pago en diciembre)</option>
          </select>
        </label>
        <label class="field">
          <span>Fecha en que empezaste a trabajar</span>
          <input type="date" name="inicio" [value]="start()" (input)="start.set(val($event))" />
          <small>Si llevas más tiempo, deja cualquier fecha anterior al semestre.</small>
        </label>
      </form>
      <app-result-table calcResult totalLabel="Tu prima" [total]="value()" [rows]="rows()">
        <app-share-bar [text]="shareText()" [url]="shareUrl()" />
      </app-result-table>
    </app-calc-page>
  `,
})
export class Prima implements OnInit {
  protected readonly page = calculator('prima');
  protected readonly salary = signal(SMMLV_2026);
  protected readonly semester = signal('2026-2');
  protected readonly start = signal('2025-01-01');
  private readonly state = urlState('prima');

  private readonly range = computed(() =>
    this.semester().endsWith('-1') ? ['2026-01-01', '2026-06-30'] : ['2026-07-01', '2026-12-31'],
  );
  protected readonly days = computed(() => {
    const [from, to] = this.range();
    return days360(maxIso(this.start() || from, from), to);
  });
  protected readonly base = computed(() => benefitsBase(this.salary()));
  protected readonly value = computed(() => roundPeso(prima(this.base(), this.days())));
  protected readonly rows = computed<ResultRow[]>(() => [
    {
      label: 'Base (salario + auxilio)',
      value: this.base(),
      detail: hasTransportAllowance(this.salary())
        ? 'Incluye auxilio de transporte'
        : 'Sin auxilio de transporte',
    },
    { label: 'Días trabajados en el semestre', value: 0, text: `${this.days()} de 180` },
  ]);
  protected readonly shareUrl = computed(() =>
    this.state.link({ salario: this.salary(), semestre: this.semester(), inicio: this.start() }),
  );
  protected readonly shareText = computed(
    () =>
      `Mi prima de servicios aproximada: ${formatCop(this.value())}. Calcula la tuya en Cuadre:`,
  );

  ngOnInit(): void {
    this.state.read((get) => {
      this.salary.set(num(get('salario'), this.salary()));
      const s = get('semestre');
      if (s === '2026-1' || s === '2026-2') this.semester.set(s);
      this.start.set(isoOr(get('inicio'), this.start()));
    });
  }

  protected val(e: Event): string {
    return (e.target as HTMLInputElement).value;
  }
}
