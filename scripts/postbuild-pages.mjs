// GitHub Pages: 404 page for unknown paths and skip Jekyll processing.
import { copyFileSync, existsSync, writeFileSync } from 'node:fs';
const out = new URL('../dist/cuadre/browser/', import.meta.url).pathname;
const notFound = existsSync(out + '404/index.html') ? out + '404/index.html' : out + 'index.html';
copyFileSync(notFound, out + '404.html');
writeFileSync(out + '.nojekyll', '');
