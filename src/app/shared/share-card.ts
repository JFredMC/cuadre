import { formatCop } from '../core/calc';
import type { ResultRow } from './result-table';

export interface ShareCardData {
  title: string;
  totalLabel: string;
  total: number;
  rows: ResultRow[];
  note?: string;
}

export const CARD_W = 1080;
const PAD = 72;
const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';

/** Texto que se muestra a la derecha de cada fila (igual que en la tarjeta). */
export function rowValue(r: ResultRow): string {
  return r.text ?? (r.negative ? '− ' : '') + formatCop(r.value);
}

/** Parte un texto en líneas que caben en `max` píxeles. */
export function wrapText(ctx: CanvasRenderingContext2D, text: string, max: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const test = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(test).width > max) {
      lines.push(line);
      line = word;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

/** Dibuja la tarjeta del resultado y devuelve el canvas (1080 px de ancho). */
export function drawShareCard(data: ShareCardData, doc: Document = document): HTMLCanvasElement {
  const canvas = doc.createElement('canvas');
  const measure = canvas.getContext('2d');
  if (!measure) throw new Error('Canvas no disponible');
  const inner = CARD_W - PAD * 2;

  measure.font = `400 30px ${FONT}`;
  const noteLines = data.note ? wrapText(measure, data.note, inner) : [];
  const rowLayouts = data.rows.map((r) => {
    measure.font = `600 34px ${FONT}`;
    const valueW = measure.measureText(rowValue(r)).width;
    const labelLines = wrapText(measure, r.label, inner - valueW - 32);
    measure.font = `400 26px ${FONT}`;
    const detailLines = r.detail ? wrapText(measure, r.detail, inner - valueW - 32) : [];
    return { r, labelLines, detailLines, h: 40 + labelLines.length * 42 + detailLines.length * 34 };
  });

  const headerH = 170;
  const totalH = 60 + 130;
  const rowsH = rowLayouts.reduce((s, l) => s + l.h, 0);
  const noteH = noteLines.length ? 30 + noteLines.length * 42 : 0;
  const footerH = 150;
  const height = Math.ceil(PAD + headerH + totalH + rowsH + noteH + footerH);
  canvas.width = CARD_W;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#10302d';
  ctx.fillRect(0, 0, CARD_W, height);
  ctx.textBaseline = 'alphabetic';

  // Marca
  let y = PAD;
  ctx.fillStyle = '#0f766e';
  ctx.beginPath();
  ctx.roundRect(PAD, y, 64, 64, 16);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = `800 40px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText('C', PAD + 32, y + 46);
  ctx.textAlign = 'left';
  ctx.font = `800 44px ${FONT}`;
  ctx.fillText('Cuadre', PAD + 84, y + 46);
  ctx.fillStyle = '#a8d5ce';
  ctx.font = `500 30px ${FONT}`;
  ctx.fillText(data.title, PAD, y + 130, inner);
  y += headerH;

  // Total
  ctx.fillStyle = '#a8d5ce';
  ctx.font = `500 32px ${FONT}`;
  ctx.fillText(data.totalLabel, PAD, y + 32, inner);
  ctx.fillStyle = '#fff';
  ctx.font = `800 104px ${FONT}`;
  ctx.fillText(formatCop(data.total), PAD, y + 150, inner);
  y += totalH;

  // Filas
  for (const l of rowLayouts) {
    ctx.strokeStyle = 'rgba(255,255,255,0.14)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(PAD, y);
    ctx.lineTo(CARD_W - PAD, y);
    ctx.stroke();
    let ly = y + 54;
    ctx.fillStyle = '#eaf6f4';
    ctx.font = `500 34px ${FONT}`;
    for (const t of l.labelLines) {
      ctx.fillText(t, PAD, ly);
      ly += 42;
    }
    ctx.fillStyle = 'rgba(234,246,244,0.72)';
    ctx.font = `400 26px ${FONT}`;
    for (const t of l.detailLines) {
      ctx.fillText(t, PAD, ly - 8);
      ly += 34;
    }
    ctx.textAlign = 'right';
    ctx.fillStyle = l.r.negative ? '#ffb4a8' : '#fff';
    ctx.font = `700 34px ${FONT}`;
    ctx.fillText(rowValue(l.r), CARD_W - PAD, y + 54);
    ctx.textAlign = 'left';
    y += l.h;
  }

  // Nota
  if (noteLines.length) {
    y += 30;
    ctx.fillStyle = '#c7e3de';
    ctx.font = `400 30px ${FONT}`;
    for (const t of noteLines) {
      ctx.fillText(t, PAD, y + 30);
      y += 42;
    }
  }

  // Pie
  const fy = height - 70;
  ctx.fillStyle = '#f4b740';
  ctx.fillRect(PAD, fy - 60, 80, 6);
  ctx.fillStyle = '#fff';
  ctx.font = `700 34px ${FONT}`;
  ctx.fillText('cuadrelaboral.com', PAD, fy);
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(234,246,244,0.55)';
  ctx.font = `500 24px ${FONT}`;
  ctx.fillText('by JFredDev', CARD_W - PAD, fy);
  ctx.textAlign = 'left';
  return canvas;
}

/** Genera el PNG de la tarjeta. */
export async function shareCardPng(data: ShareCardData, doc: Document = document): Promise<Blob> {
  const canvas = drawShareCard(data, doc);
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('No se pudo crear la imagen'))),
      'image/png',
    ),
  );
}

export function shareFileName(title: string): string {
  const slug = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `cuadre-${slug || 'resultado'}.png`;
}

/** true si el navegador puede compartir archivos (móvil → el usuario elige WhatsApp). */
export function canShareFiles(nav: Navigator, file: File): boolean {
  return (
    typeof nav.share === 'function' &&
    typeof nav.canShare === 'function' &&
    nav.canShare({ files: [file] })
  );
}
