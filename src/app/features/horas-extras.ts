import { ChangeDetectionStrategy, Component, OnInit, computed, signal } from '@angular/core';
import {
  HOUR_KINDS,
  HourKind,
  VALUES_UPDATED_AT,
  formatCop,
  horasExtras,
  hourFactor,
} from '../core/calc';
import { calculator } from '../core/site';
import { CalcPage } from '../shared/calc-page';
import { MoneyInput } from '../shared/money-input';
import { ResultRow, ResultTable } from '../shared/result-table';
import { ShareBar } from '../shared/share-bar';
import { isoOr, num, urlState } from '../shared/url-state';

export const HOUR_LABELS: Record<HourKind, string> = {
  extraDiurna: 'Hora extra diurna',
  extraNocturna: 'Hora extra nocturna',
  recargoNocturno: 'Recargo nocturno (hora ordinaria)',
  dominical: 'Dominical o festivo diurno (hora ordinaria)',
  dominicalNocturno: 'Dominical o festivo nocturno (hora ordinaria)',
  extraDiurnaDominical: 'Hora extra diurna dominical o festiva',
  extraNocturnaDominical: 'Hora extra nocturna dominical o festiva',
};

const pct = (n: number) => `${Math.round(n * 100)}%`;

@Component({
  selector: 'app-horas-extras',
  imports: [CalcPage, MoneyInput, ResultTable, ShareBar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-calc-page [page]="page">
      <form class="card form" (submit)="$event.preventDefault()">
        <app-money-input label="Salario mensual" name="salario" [(value)]="salary" />
        <label class="field">
          <span>Fecha en que trabajaste las horas</span>
          <input type="date" name="fecha" [value]="date()" (input)="setDate($event)" />
        </label>
        <p class="regime" data-testid="regime">
          Jornada de <strong>{{ regime().weeklyHours }} h</strong> semanales ({{
            regime().monthlyHours
          }}
          h al mes), recargo dominical del <strong>{{ pct(regime().sundaySurcharge) }}</strong> y
          nocturno desde las
          <strong>{{ regime().nightStartHour === 19 ? '7:00 p. m.' : '9:00 p. m.' }}</strong
          >.
        </p>
        <fieldset class="hours">
          <legend>Horas trabajadas en el mes</legend>
          @for (k of kinds; track k) {
            <label class="field inline">
              <span
                >{{ labels[k] }} <small>×{{ factor(k) }}</small></span
              >
              <input
                type="number"
                inputmode="decimal"
                min="0"
                step="0.5"
                [attr.name]="k"
                [value]="hours()[k] || ''"
                (input)="setHours(k, $event)"
              />
            </label>
          }
        </fieldset>
      </form>
      <app-result-table
        totalLabel="Total a pagar por horas extras y recargos"
        [total]="r().total"
        [rows]="rows()"
      >
        <p class="note">
          Valor de la hora ordinaria: {{ cop(r().hourlyRate) }}. Las horas extras se pagan completas
          (hora + recargo); en las horas ordinarias nocturnas o dominicales solo se suma el recargo.
        </p>
        <app-share-bar [text]="shareText()" [url]="shareUrl()" />
      </app-result-table>
    </app-calc-page>
  `,
})
export class HorasExtras implements OnInit {
  protected readonly page = calculator('horas-extras');
  protected readonly kinds = HOUR_KINDS;
  protected readonly labels = HOUR_LABELS;
  protected readonly pct = pct;
  protected readonly cop = formatCop;
  protected readonly salary = signal(2_100_000);
  protected readonly date = signal(VALUES_UPDATED_AT);
  protected readonly hours = signal<Partial<Record<HourKind, number>>>({
    extraDiurna: 4,
    dominical: 8,
  });
  private readonly state = urlState('horas-extras');

  protected readonly r = computed(() => horasExtras(this.salary(), this.date(), this.hours()));
  protected readonly regime = computed(() => this.r().regime);
  protected readonly rows = computed<ResultRow[]>(() =>
    this.r().lines.map((l) => ({
      label: this.labels[l.kind],
      value: l.value,
      detail: `${l.hours} h × ${formatCop(this.r().hourlyRate)} × ${l.factor.toFixed(2).replace('.', ',')}`,
    })),
  );
  protected readonly shareUrl = computed(() => {
    const params: Record<string, string | number> = { salario: this.salary(), fecha: this.date() };
    for (const [k, v] of Object.entries(this.hours())) if (v) params[k] = v;
    return this.state.link(params);
  });
  protected readonly shareText = computed(
    () =>
      `Mis horas extras y recargos suman ${formatCop(this.r().total)}. Calcula las tuyas en Cuadre:`,
  );

  ngOnInit(): void {
    this.state.read((get) => {
      this.salary.set(num(get('salario'), this.salary()));
      this.date.set(isoOr(get('fecha'), this.date()));
      const h: Partial<Record<HourKind, number>> = {};
      for (const k of HOUR_KINDS) {
        const v = num(get(k), 0);
        if (v) h[k] = v;
      }
      this.hours.set(h);
    });
  }

  protected factor(k: HourKind): string {
    return hourFactor(k, this.regime().sundaySurcharge).toFixed(2).replace('.', ',');
  }

  protected setDate(e: Event): void {
    const v = (e.target as HTMLInputElement).value;
    if (v) this.date.set(v);
  }

  protected setHours(k: HourKind, e: Event): void {
    const n = Math.max(0, +(e.target as HTMLInputElement).value || 0);
    this.hours.update((h) => ({ ...h, [k]: n }));
  }
}
