import { Routes } from '@angular/router';
import { Home } from './features/home';
import { HorasExtras } from './features/horas-extras';
import { Independientes } from './features/independientes';
import { Intereses } from './features/intereses';
import { Liquidacion } from './features/liquidacion';
import { NotFound } from './features/not-found';
import { Plantillas } from './features/plantillas';
import { PlantillasGracias } from './features/plantillas-gracias';
import { Prima } from './features/prima';
import { SalarioNeto } from './features/salario-neto';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'liquidacion', component: Liquidacion },
  { path: 'salario-neto', component: SalarioNeto },
  { path: 'prima', component: Prima },
  { path: 'intereses-cesantias', component: Intereses },
  { path: 'horas-extras', component: HorasExtras },
  { path: 'seguridad-social-independientes', component: Independientes },
  { path: 'plantillas', component: Plantillas },
  { path: 'plantillas/gracias', component: PlantillasGracias },
  { path: '404', component: NotFound },
  { path: '**', component: NotFound },
];
