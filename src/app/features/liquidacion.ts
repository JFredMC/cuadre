import { ChangeDetectionStrategy, Component, OnInit, computed, signal } from '@angular/core';
import { SMMLV_2026, formatCop, liquidacion } from '../core/calc';
import { calculator } from '../core/site';
import { CalcPage } from '../shared/calc-page';
import { MoneyInput } from '../shared/money-input';
import { ResultRow, ResultTable } from '../shared/result-table';
import { ShareBar } from '../shared/share-bar';
import { isoOr, num, urlState } from '../shared/url-state';

@Component({
  selector: 'app-liquidacion',
  imports: [CalcPage, MoneyInput, ResultTable, ShareBar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-calc-page [page]="page">
      <form class="card form" (submit)="$event.preventDefault()">
        <div class="grid2">
          <label class="field">
            <span>Fecha de inicio</span>
            <input type="date" name="inicio" [value]="start()" (input)="start.set(val($event))" />
          </label>
          <label class="field">
            <span>Fecha de terminación</span>
            <input type="date" name="fin" [value]="end()" (input)="end.set(val($event))" />
          </label>
        </div>
        <app-money-input label="Salario mensual" name="salario" [(value)]="salary" />
        <label class="field">
          <span>Días de vacaciones ya disfrutados</span>
          <input
            type="number"
            inputmode="numeric"
            min="0"
            name="vacaciones"
            [value]="taken()"
            (input)="taken.set(+val($event) || 0)"
          />
        </label>
      </form>
      @if (result(); as r) {
        <app-result-table totalLabel="Total liquidación" [total]="r.total" [rows]="rows()">
          <p class="note">
            {{ r.totalDays }} días trabajados (año de 360 días).
            {{
              r.includeAllowance
                ? 'Incluye auxilio de transporte en la base.'
                : 'Sin auxilio de transporte (salario mayor a 2 SMMLV).'
            }}
            No incluye indemnización por despido ni salarios pendientes.
          </p>
          <app-share-bar [text]="shareText()" [url]="shareUrl()" />
        </app-result-table>
      } @else {
        <p class="error" role="alert">
          Revisa las fechas: la terminación debe ser posterior al inicio.
        </p>
      }
    </app-calc-page>
  `,
})
export class Liquidacion implements OnInit {
  protected readonly page = calculator('liquidacion');
  protected readonly start = signal('2026-02-01');
  protected readonly end = signal('2026-08-31');
  protected readonly salary = signal(SMMLV_2026);
  protected readonly taken = signal(0);
  private readonly state = urlState('liquidacion');

  protected readonly result = computed(() => {
    if (!this.start() || !this.end() || this.end() < this.start()) return null;
    return liquidacion({
      start: this.start(),
      end: this.end(),
      salary: this.salary(),
      vacationDaysTaken: this.taken(),
    });
  });
  protected readonly rows = computed<ResultRow[]>(() => {
    const r = this.result();
    if (!r) return [];
    return [
      {
        label: 'Cesantías',
        value: r.cesantias,
        detail: `${r.cesantiasDays} días del año en curso`,
      },
      { label: 'Intereses de cesantías', value: r.intereses, detail: '12% anual proporcional' },
      { label: 'Prima de servicios', value: r.prima, detail: `${r.primaDays} días del semestre` },
      {
        label: 'Vacaciones',
        value: r.vacaciones,
        detail: `${r.vacationDays.toFixed(2).replace('.', ',')} días pendientes`,
      },
    ];
  });
  protected readonly shareUrl = computed(() =>
    this.state.link({
      inicio: this.start(),
      fin: this.end(),
      salario: this.salary(),
      vac: this.taken(),
    }),
  );
  protected readonly shareText = computed(
    () =>
      `Mi liquidación laboral aproximada: ${formatCop(this.result()?.total ?? 0)}. Calcula la tuya en Cuadre:`,
  );

  ngOnInit(): void {
    this.state.read((get) => {
      this.start.set(isoOr(get('inicio'), this.start()));
      this.end.set(isoOr(get('fin'), this.end()));
      this.salary.set(num(get('salario'), this.salary()));
      this.taken.set(num(get('vac'), 0));
    });
  }

  protected val(e: Event): string {
    return (e.target as HTMLInputElement).value;
  }
}
