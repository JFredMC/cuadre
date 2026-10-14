// GitHub Pages: 404 page, .nojekyll, sitemap.xml and robots.txt from the prerendered routes.
import { copyFileSync, existsSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SITE = 'https://cuadrelaboral.com/';
const out = new URL('../dist/cuadre/browser/', import.meta.url).pathname;

copyFileSync(
  existsSync(join(out, '404/index.html')) ? join(out, '404/index.html') : join(out, 'index.html'),
  join(out, '404.html'),
);
writeFileSync(join(out, '.nojekyll'), '');
writeFileSync(join(out, 'CNAME'), 'cuadrelaboral.com\n');

const routes = [''];
for (const name of readdirSync(out)) {
  if (name === '404') continue;
  if (statSync(join(out, name)).isDirectory() && existsSync(join(out, name, 'index.html')))
    routes.push(name + '/');
}
const today = new Date().toISOString().slice(0, 10);
const urls = routes
  .sort()
  .map(
    (r) =>
      `  <url><loc>${SITE}${r}</loc><lastmod>${today}</lastmod><priority>${r ? '0.8' : '1.0'}</priority></url>`,
  )
  .join('\n');
writeFileSync(
  join(out, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
);
writeFileSync(join(out, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}sitemap.xml\n`);
console.log(`sitemap.xml con ${routes.length} URLs`);
