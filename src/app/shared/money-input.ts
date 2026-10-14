import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

/** Campo de pesos con separador de miles, pensado para teclado numérico en celular. */
@Component({
  selector: 'app-money-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="field">
      <span>{{ label() }}</span>
      <span class="money">
        <span aria-hidden="true">$</span>
        <input
          type="text"
          inputmode="numeric"
          autocomplete="off"
          [attr.name]="name()"
          [value]="format(value())"
          (input)="onInput($event)"
        />
      </span>
      @if (hint()) {
        <small>{{ hint() }}</small>
      }
    </label>
  `,
})
export class MoneyInput {
  readonly label = input.required<string>();
  readonly name = input.required<string>();
  readonly hint = input('');
  readonly value = model.required<number>();

  protected format(v: number): string {
    return v ? new Intl.NumberFormat('es-CO').format(v) : '';
  }

  protected onInput(event: Event): void {
    const el = event.target as HTMLInputElement;
    const digits = el.value.replace(/\D/g, '').slice(0, 12);
    const n = digits ? Number(digits) : 0;
    this.value.set(n);
    el.value = this.format(n);
  }
}
