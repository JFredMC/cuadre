// Escribe src/app/core/ads-config.ts con ADSENSE_CLIENT / ADSENSE_SLOT (variables del repo).
// Sin valores, los espacios de anuncios no se muestran.
import { writeFileSync } from 'node:fs';
const clean = (v) => (v ?? '').trim().replace(/[^\w-]/g, '');
const client = clean(process.env.ADSENSE_CLIENT);
const slot = clean(process.env.ADSENSE_SLOT);
writeFileSync(
  new URL('../src/app/core/ads-config.ts', import.meta.url),
  `// Generado por scripts/write-ads-config.mjs a partir de las variables del repo
// ADSENSE_CLIENT y ADSENSE_SLOT. Vacío = no se muestran anuncios.
export const ADSENSE_CLIENT = '${client}';
export const ADSENSE_SLOT = '${slot}';
`,
);
console.log(client ? `AdSense activo (${client})` : 'AdSense desactivado');
