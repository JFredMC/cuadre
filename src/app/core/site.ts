import { LegalSource, SOURCES } from './calc';

export const SITE_NAME = 'Cuadre';
export const SITE_URL = 'https://cuadrelaboral.com/';
export const PORTFOLIO_URL = 'https://jfredmc.github.io/portfolio/';
export const NAPA_URL = 'https://napaofertas.com';

export interface Faq {
  q: string;
  a: string;
}

export interface CalcPageMeta {
  slug: string;
  /** Título corto para menús y tarjetas. */
  name: string;
  icon: string;
  title: string;
  h1: string;
  description: string;
  intro: string;
  sources: LegalSource[];
  faq: Faq[];
}

export const CALCULATORS: CalcPageMeta[] = [
  {
    slug: 'liquidacion',
    name: 'Liquidación laboral',
    icon: '🧾',
    title: 'Calculadora de liquidación laboral 2026 en Colombia',
    h1: 'Calculadora de liquidación laboral 2026',
    description:
      'Calcula tu liquidación en Colombia: cesantías, intereses de cesantías, prima de servicios y vacaciones con las fechas del contrato y tu salario. Valores 2026.',
    intro:
      'Pon la fecha de inicio, la fecha de terminación y tu salario. Te mostramos cuánto te deben de cesantías, intereses, prima y vacaciones.',
    sources: [SOURCES.cst, SOURCES.intereses, SOURCES.smmlv, SOURCES.auxilio],
    faq: [
      {
        q: '¿Qué incluye la liquidación laboral?',
        a: 'Las cesantías y sus intereses del año en curso, la prima del semestre en curso y las vacaciones pendientes. Si el despido fue sin justa causa, también hay indemnización, que esta calculadora no incluye.',
      },
      {
        q: '¿El auxilio de transporte cuenta para la liquidación?',
        a: 'Sí, para cesantías y prima cuando ganas hasta dos salarios mínimos. No cuenta para vacaciones.',
      },
      {
        q: '¿Cómo se cuentan los días?',
        a: 'Con año comercial de 360 días y meses de 30, contando el primer y el último día trabajado.',
      },
      {
        q: '¿Cuánto tiempo tiene el empleador para pagarla?',
        a: 'Debe pagarla al terminar el contrato. Si no lo hace, puede deber una indemnización moratoria (art. 65 del CST).',
      },
    ],
  },
  {
    slug: 'salario-neto',
    name: 'Salario neto',
    icon: '💵',
    title: 'Calculadora de salario neto 2026 en Colombia',
    h1: 'Calculadora de salario neto 2026',
    description:
      'Calcula cuánto te llega cada mes: descuentos de salud (4%), pensión (4%), fondo de solidaridad pensional y auxilio de transporte 2026 en Colombia.',
    intro:
      'Escribe tu salario mensual y te mostramos los descuentos de ley y lo que realmente recibes.',
    sources: [SOURCES.ley100, SOURCES.smmlv, SOURCES.auxilio, SOURCES.uvt],
    faq: [
      {
        q: '¿Cuánto me descuentan del salario en Colombia?',
        a: 'El 4% para salud y el 4% para pensión. Si ganas 4 salarios mínimos o más, se suma entre el 1% y el 2% para el Fondo de Solidaridad Pensional.',
      },
      {
        q: '¿Quién recibe auxilio de transporte en 2026?',
        a: 'Quien gana hasta dos salarios mínimos ($3.501.810 en 2026). Son $249.095 al mes y no tienen descuentos de salud ni pensión.',
      },
      {
        q: '¿Esta calculadora incluye retención en la fuente?',
        a: 'No. La retención depende de tus deducciones y rentas exentas. Si tu ingreso supera unas 95 UVT al mes, es probable que te apliquen retención.',
      },
    ],
  },
  {
    slug: 'prima',
    name: 'Prima de servicios',
    icon: '🎁',
    title: 'Calculadora de prima de servicios 2026 en Colombia',
    h1: 'Calculadora de prima de servicios 2026',
    description:
      'Calcula tu prima de junio o diciembre en Colombia según tu salario, el auxilio de transporte 2026 y los días trabajados en el semestre.',
    intro:
      'La prima equivale a 15 días de salario por cada semestre trabajado. Elige el semestre y la fecha en que empezaste.',
    sources: [SOURCES.cst, SOURCES.smmlv, SOURCES.auxilio],
    faq: [
      {
        q: '¿Cuándo se paga la prima?',
        a: 'La mitad a más tardar el 30 de junio y la otra mitad a más tardar el 20 de diciembre.',
      },
      {
        q: '¿Cómo se calcula la prima?',
        a: '(Salario + auxilio de transporte) × días trabajados en el semestre ÷ 360.',
      },
      {
        q: '¿Las empleadas domésticas tienen prima?',
        a: 'Sí, desde la Ley 1788 de 2016 tienen derecho a la prima igual que los demás trabajadores.',
      },
    ],
  },
  {
    slug: 'intereses-cesantias',
    name: 'Intereses de cesantías',
    icon: '📈',
    title: 'Calculadora de intereses de cesantías 2026',
    h1: 'Calculadora de intereses de cesantías',
    description:
      'Calcula los intereses sobre cesantías (12% anual) que tu empleador te debe pagar a más tardar el 31 de enero, proporcionales a los días trabajados.',
    intro:
      'Escribe el valor de tus cesantías y los días trabajados en el año. Los intereses son el 12% anual, proporcional a los días.',
    sources: [SOURCES.intereses, SOURCES.cst],
    faq: [
      {
        q: '¿Cuándo se pagan los intereses de cesantías?',
        a: 'Directamente al trabajador, a más tardar el 31 de enero de cada año, o al terminar el contrato.',
      },
      {
        q: '¿Qué pasa si no me los pagan a tiempo?',
        a: 'El empleador debe pagar una suma adicional igual a los intereses (es decir, el doble) según la Ley 52 de 1975.',
      },
      {
        q: '¿Las cesantías y los intereses son lo mismo?',
        a: 'No. Las cesantías se consignan al fondo antes del 14 de febrero; los intereses (12% de las cesantías) se pagan directo al trabajador.',
      },
    ],
  },
  {
    slug: 'horas-extras',
    name: 'Horas extras y recargos',
    icon: '⏰',
    title: 'Calculadora de horas extras y recargos 2026 (42 horas, dominical 90%)',
    h1: 'Calculadora de horas extras y recargos 2026',
    description:
      'Calcula horas extras diurnas y nocturnas, recargo nocturno y dominical o festivo en Colombia con la jornada de 42 horas y el recargo dominical del 90% desde julio de 2026.',
    intro:
      'Elige la fecha de las horas, porque la jornada y el recargo dominical cambiaron en julio de 2026. Luego escribe cuántas horas de cada tipo trabajaste.',
    sources: [SOURCES.jornada, SOURCES.reforma, SOURCES.cst],
    faq: [
      {
        q: '¿Cuál es la jornada laboral en Colombia en 2026?',
        a: '44 horas semanales hasta el 14 de julio de 2026 y 42 horas desde el 15 de julio de 2026 (Ley 2101 de 2021).',
      },
      {
        q: '¿Cuánto es el recargo dominical en 2026?',
        a: 'El 80% hasta el 30 de junio de 2026 y el 90% desde el 1 de julio de 2026. Desde el 1 de julio de 2027 será el 100% (Ley 2466 de 2025).',
      },
      {
        q: '¿Desde qué hora empieza el recargo nocturno?',
        a: 'Desde las 7:00 p. m. hasta las 6:00 a. m., vigente desde el 25 de diciembre de 2025. El recargo nocturno es del 35%.',
      },
      {
        q: '¿Cuánto vale una hora extra?',
        a: 'La extra diurna se paga con 25% de recargo y la nocturna con 75%. En domingo o festivo se suma el recargo dominical.',
      },
    ],
  },
  {
    slug: 'seguridad-social-independientes',
    name: 'Seguridad social independientes',
    icon: '🧑‍💻',
    title: 'Calculadora de seguridad social para independientes 2026',
    h1: 'Seguridad social para independientes 2026',
    description:
      'Calcula cuánto pagas de salud (12,5%), pensión (16%) y ARL como independiente o contratista en Colombia, sobre un IBC del 40% de tus ingresos. Valores 2026.',
    intro:
      'Escribe tu ingreso mensual (sin IVA) y tu clase de riesgo ARL. El aporte se calcula sobre el 40% del ingreso.',
    sources: [SOURCES.independientes, SOURCES.ley100, SOURCES.arl, SOURCES.smmlv],
    faq: [
      {
        q: '¿Sobre qué valor cotiza un independiente?',
        a: 'Sobre el 40% de su ingreso mensual (IBC), sin bajar de un salario mínimo ni superar 25 salarios mínimos.',
      },
      {
        q: '¿Qué porcentajes paga un independiente?',
        a: 'Salud 12,5%, pensión 16% y, si gana 4 salarios mínimos o más, el fondo de solidaridad. La ARL depende de la clase de riesgo.',
      },
      {
        q: '¿Si gano menos de un salario mínimo tengo que cotizar?',
        a: 'Según la UGPP, si tu ingreso neto mensual es menor a un salario mínimo no estás obligado a cotizar como independiente.',
      },
      {
        q: '¿Puedo restar costos?',
        a: 'Los independientes por cuenta propia pueden restar costos con soportes o usar el esquema de presunción de costos de la UGPP. Esta calculadora no los resta.',
      },
    ],
  },
];

export const calculator = (slug: string) => {
  const found = CALCULATORS.find((c) => c.slug === slug);
  if (!found) throw new Error(`Calculadora desconocida: ${slug}`);
  return found;
};

/** "13 de octubre de 2026" */
export function longDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const months = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ];
  return `${d} de ${months[m - 1]} de ${y}`;
}
