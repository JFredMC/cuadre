import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CALCULATORS, NAPA_URL, PORTFOLIO_URL } from './core/site';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly calculators = CALCULATORS;
  protected readonly napa = NAPA_URL;
  protected readonly portfolio = PORTFOLIO_URL;
}
