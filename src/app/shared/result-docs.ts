import { formatCop } from '../core/calc';
import { SITE_URL } from '../core/site';
import type { ShareCardData } from './share-card';
import { rowValue } from './share-card';

export type DocFormat = 'pdf' | 'xlsx' | 'docx';

export interface InputItem {
  label: string;
  value: string;
}

export interface ResultDoc extends ShareCardData {
  generatedAt: Date;
  inputs: InputItem[];
  disclaimer: string;
  url: string;
}

export const BRAND = 'Cuadre';
export const DOMAIN = 'cuadrelaboral.com';
export const MARK = 'by JFredDev';

export const MIME: Record<DocFormat, string> = {
  pdf: 'application/pdf',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

export function generatedLabel(d: Date): string {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'America/Bogota',
  }).format(d);
}

const clean = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, ' ').trim();

/** Lee los datos ingresados en el formulario de la calculadora (etiqueta + valor visible). */
export function readInputs(form: Element | null): InputItem[] {
  if (!form) return [];
  const out: InputItem[] = [];
  form
    .querySelectorAll<HTMLInputElement | HTMLSelectElement>('input[name], select[name]')
    .forEach((el) => {
      const label = el.closest('label');
      const name = clean(
        label?.querySelector(':scope > span')?.textContent ?? label?.textContent ?? el.name,
      );
      let value: string;
      if (el instanceof HTMLSelectElement) value = clean(el.selectedOptions[0]?.textContent);
      else if (el.type === 'checkbox' || el.type === 'radio') {
        if (el.type === 'radio' && !el.checked) return;
        value = el.type === 'checkbox' ? (el.checked ? 'Sí' : 'No') : clean(label?.textContent);
      } else value = el.closest('.money') ? (el.value ? `$ ${el.value}` : '$ 0') : el.value;
      if (name) out.push({ label: name, value: value || '—' });
    });
  return out;
}

/** Filas tabulares comunes a los tres formatos. */
export function breakdown(doc: ResultDoc): [string, string][] {
  return doc.rows.map((r) => [r.detail ? `${r.label} (${r.detail})` : r.label, rowValue(r)]);
}

export function docFileName(title: string, fmt: DocFormat): string {
  const slug = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `cuadre-${slug || 'resultado'}.${fmt}`;
}

const GREEN: [number, number, number] = [16, 48, 45];
const TEAL: [number, number, number] = [15, 118, 110];

async function pdf(d: ResultDoc): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  const M = 48;
  let y = 0;
  const ensure = (h: number) => {
    if (y + h > H - 70) {
      pdf.addPage();
      y = M;
    }
  };
  pdf.setFillColor(...GREEN);
  pdf.rect(0, 0, W, 96, 'F');
  pdf.setFillColor(...TEAL);
  pdf.roundedRect(M, 28, 40, 40, 8, 8, 'F');
  pdf.setTextColor(255, 255, 255).setFont('helvetica', 'bold').setFontSize(22);
  pdf.text('C', M + 20, 56, { align: 'center' });
  pdf.text(BRAND, M + 54, 56);
  pdf.setFont('helvetica', 'normal').setFontSize(11).setTextColor(168, 213, 206);
  pdf.text(DOMAIN, W - M, 56, { align: 'right' });
  y = 130;
  pdf.setTextColor(24, 34, 43).setFont('helvetica', 'bold').setFontSize(16);
  pdf.text(d.title, M, y);
  y += 18;
  pdf.setFont('helvetica', 'normal').setFontSize(10).setTextColor(91, 103, 112);
  pdf.text(`Generado el ${generatedLabel(d.generatedAt)}`, M, y);
  const section = (t: string) => {
    ensure(40);
    y += 30;
    pdf
      .setFont('helvetica', 'bold')
      .setFontSize(12)
      .setTextColor(...TEAL);
    pdf.text(t, M, y);
    y += 8;
  };
  const row = (a: string, b: string, bold = false) => {
    const lines = pdf.setFontSize(11).splitTextToSize(a, W - M * 2 - 160) as string[];
    ensure(lines.length * 14 + 10);
    y += 18;
    pdf.setFont('helvetica', bold ? 'bold' : 'normal').setTextColor(24, 34, 43);
    pdf.text(lines, M, y);
    pdf.setFont('helvetica', 'bold');
    pdf.text(b, W - M, y, { align: 'right' });
    y += (lines.length - 1) * 14 + 6;
    pdf.setDrawColor(226, 230, 225).line(M, y, W - M, y);
  };
  if (d.inputs.length) {
    section('Datos ingresados');
    d.inputs.forEach((i) => row(i.label, i.value));
  }
  section('Resultado');
  ensure(60);
  y += 16;
  pdf.setFillColor(...GREEN);
  pdf.roundedRect(M, y, W - M * 2, 56, 8, 8, 'F');
  pdf.setTextColor(168, 213, 206).setFont('helvetica', 'normal').setFontSize(10);
  pdf.text(d.totalLabel, M + 14, y + 20);
  pdf.setTextColor(255, 255, 255).setFont('helvetica', 'bold').setFontSize(20);
  pdf.text(formatCop(d.total), M + 14, y + 44);
  y += 60;
  breakdown(d).forEach(([a, b]) => row(a, b.replace(/\u2212/g, '-')));
  const para = (t: string, size: number, color: [number, number, number]) => {
    const lines = pdf
      .setFont('helvetica', 'normal')
      .setFontSize(size)
      .splitTextToSize(t, W - M * 2) as string[];
    ensure(lines.length * (size + 4) + 16);
    y += 22;
    pdf.setTextColor(...color);
    pdf.text(lines, M, y);
    y += (lines.length - 1) * (size + 4);
  };
  if (d.note) para(d.note, 10, [24, 34, 43]);
  para(d.disclaimer, 9, [91, 103, 112]);
  const pages = pdf.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    pdf.setPage(p);
    pdf.setFontSize(9).setFont('helvetica', 'normal').setTextColor(91, 103, 112);
    pdf.text(`${BRAND} · ${DOMAIN}`, M, H - 32);
    pdf.setTextColor(160, 168, 174);
    pdf.text(MARK, W - M, H - 32, { align: 'right' });
  }
  return pdf.output('blob');
}

async function xlsx(d: ResultDoc): Promise<Blob> {
  const { default: write } = await import('write-excel-file/universal');
  const b = { fontWeight: 'bold' as const };
  const money = (v: number) => ({ value: v, type: Number, format: '"$" #,##0' });
  const data: unknown[][] = [
    [{ value: `${BRAND} · ${DOMAIN}`, ...b, fontSize: 16, color: '#0f766e' }],
    [{ value: d.title, ...b }],
    [`Generado el ${generatedLabel(d.generatedAt)}`],
    [],
  ];
  if (d.inputs.length) {
    data.push([{ value: 'Datos ingresados', ...b, color: '#0f766e' }]);
    d.inputs.forEach((i) => data.push([i.label, i.value]));
    data.push([]);
  }
  data.push([{ value: 'Resultado', ...b, color: '#0f766e' }]);
  data.push([
    { value: d.totalLabel, ...b },
    { ...money(d.total), ...b },
  ]);
  d.rows.forEach((r) => {
    const label = r.detail ? `${r.label} (${r.detail})` : r.label;
    data.push([label, r.text ? r.text : money(r.negative ? -r.value : r.value)]);
  });
  data.push([]);
  if (d.note) data.push([{ value: d.note, wrap: true }]);
  data.push([{ value: d.disclaimer, wrap: true, color: '#5b6770' }]);
  data.push([]);
  data.push([
    { value: `${d.url}`, color: '#5b6770' },
    { value: MARK, color: '#a0a8ae' },
  ]);
  return write(data as never, {
    sheet: 'Cuadre',
    columns: [{ width: 60 }, { width: 22 }],
  }).toBlob();
}

async function docx(d: ResultDoc): Promise<Blob> {
  const x = await import('docx');
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    WidthType,
    AlignmentType,
    Footer,
    Header,
  } = x;
  const cell = (t: string, bold = false, right = false) =>
    new TableCell({
      width: { size: right ? 30 : 70, type: WidthType.PERCENTAGE },
      children: [
        new Paragraph({
          alignment: right ? AlignmentType.RIGHT : AlignmentType.LEFT,
          children: [new TextRun({ text: t, bold })],
        }),
      ],
    });
  const table = (rows: [string, string][], boldFirst = false) =>
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: rows.map(
        ([a, b], i) =>
          new TableRow({ children: [cell(a, boldFirst && i === 0), cell(b, true, true)] }),
      ),
    });
  const h = (t: string) =>
    new Paragraph({
      spacing: { before: 280, after: 120 },
      children: [new TextRun({ text: t, bold: true, color: '0F766E', size: 26 })],
    });
  const children = [
    new Paragraph({ children: [new TextRun({ text: d.title, bold: true, size: 32 })] }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Generado el ${generatedLabel(d.generatedAt)}`,
          color: '5B6770',
          size: 20,
        }),
      ],
    }),
    ...(d.inputs.length
      ? [h('Datos ingresados'), table(d.inputs.map((i) => [i.label, i.value]))]
      : []),
    h('Resultado'),
    table([[d.totalLabel, formatCop(d.total)], ...breakdown(d)], true),
    ...(d.note
      ? [
          new Paragraph({
            spacing: { before: 240 },
            children: [new TextRun({ text: d.note, size: 20 })],
          }),
        ]
      : []),
    new Paragraph({
      spacing: { before: 200 },
      children: [new TextRun({ text: d.disclaimer, size: 18, color: '5B6770' })],
    }),
  ];
  const doc = new Document({
    creator: BRAND,
    title: d.title,
    sections: [
      {
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: BRAND, bold: true, color: '0F766E', size: 32 }),
                  new TextRun({ text: `   ${DOMAIN}`, color: '5B6770', size: 20 }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: `${BRAND} · ${DOMAIN}`, size: 16, color: '5B6770' }),
                  new TextRun({ text: `   ${MARK}`, size: 16, color: 'A0A8AE' }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });
  return Packer.toBlob(doc);
}

/** Genera el documento en el formato pedido (las librerías se cargan solo al usarlas). */
export async function buildResultDoc(d: ResultDoc, fmt: DocFormat): Promise<Blob> {
  const blob = fmt === 'pdf' ? await pdf(d) : fmt === 'xlsx' ? await xlsx(d) : await docx(d);
  return blob.type ? blob : new Blob([blob], { type: MIME[fmt] });
}

export const DEFAULT_URL = SITE_URL;
