import { expect, test } from '@playwright/test';

const pages = [
  ['liquidacion', 'liquidación laboral'],
  ['salario-neto', 'salario neto'],
  ['prima', 'prima de servicios'],
  ['intereses-cesantias', 'intereses de cesantías'],
  ['horas-extras', 'horas extras'],
  ['seguridad-social-independientes', 'independientes'],
] as const;

test('inicio lista las seis calculadoras y los valores 2026', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Calculadoras laborales');
  await expect(page.locator('.cards li')).toHaveCount(6);
  await expect(page.getByText('$ 1.750.905')).toBeVisible();
  const footer = page.locator('footer');
  await expect(footer.getByRole('link', { name: 'JFredDev' })).toHaveAttribute('target', '_blank');
  await expect(footer.getByRole('link', { name: 'napaofertas.com' })).toHaveAttribute(
    'href',
    'https://napaofertas.com',
  );
});

for (const [slug, name] of pages) {
  test(`${slug}: HTML prerenderizado con SEO, fuente y aviso`, async ({ page, request }) => {
    const html = await (await request.get(`${slug}/`)).text();
    expect(html).toContain(`<link rel="canonical" href="https://cuadrelaboral.com/${slug}/">`);
    expect(html).toContain('"FAQPage"');
    expect(html).toContain('data-testid="total"');
    await page.goto(`${slug}/`);
    await expect(page).toHaveTitle(new RegExp(name, 'i'));
    await expect(page.getByRole('heading', { name: 'Fuente' })).toBeVisible();
    await expect(page.getByText(/Valores actualizados a/)).toBeVisible();
    await expect(page.locator('.sources a').first()).toHaveAttribute('target', '_blank');
  });
}

test('salario neto se recalcula al escribir', async ({ page }) => {
  await page.goto('salario-neto/');
  await page.locator('input[name="salario"]').fill('8000000');
  await expect(page.getByTestId('total')).toContainText('7.280.000');
});

test('horas extras cambia jornada y recargo dominical según la fecha', async ({ page }) => {
  await page.goto('horas-extras/');
  await expect(page.getByTestId('regime')).toContainText('42 h');
  await expect(page.getByTestId('regime')).toContainText('90%');
  await page.locator('input[name="fecha"]').fill('2026-06-15');
  await expect(page.getByTestId('regime')).toContainText('44 h');
  await expect(page.getByTestId('regime')).toContainText('80%');
});

test('el enlace compartido restaura los datos y WhatsApp lleva el resultado', async ({ page }) => {
  await page.goto('seguridad-social-independientes/?ingreso=10000000&arl=0');
  await expect(page.getByTestId('total')).toContainText('1.140.000');
  const href = decodeURIComponent((await page.locator('.btn-wa').getAttribute('href')) ?? '');
  expect(href).toContain('1.140.000');
  expect(href).toContain('ingreso=10000000');
});

test('sitemap y robots', async ({ request }) => {
  const sitemap = await (await request.get('sitemap.xml')).text();
  expect(sitemap.match(/<loc>/g)).toHaveLength(8);
  expect(await (await request.get('robots.txt')).text()).toContain('sitemap.xml');
});

test('sin AdSense configurado no hay anuncios', async ({ page }) => {
  await page.goto('liquidacion/');
  await expect(page.locator('.adsbygoogle')).toHaveCount(0);
});

test('descargar imagen genera el PNG de la tarjeta', async ({ page }) => {
  await page.goto('liquidacion/');
  await expect(page.getByTestId('total')).toBeVisible();
  await page.getByText('Descargar', { exact: true }).click();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Descargar imagen del resultado' }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/^cuadre-.+\.png$/);
  const path = await download.path();
  const fs = await import('node:fs');
  const buf = fs.readFileSync(path);
  expect(buf.subarray(1, 4).toString()).toBe('PNG');
  if (process.env['SHARE_CARD_OUT']) fs.copyFileSync(path, process.env['SHARE_CARD_OUT']);
});

for (const [fmt, name, sig] of [
  ['pdf', 'PDF', '%PDF'],
  ['xlsx', 'Excel (.xlsx)', 'PK'],
  ['docx', 'Word (.docx)', 'PK'],
] as const) {
  test(`descargar el resultado en ${name}`, async ({ page }) => {
    await page.goto('liquidacion/');
    await expect(page.getByTestId('total')).toBeVisible();
    await page.getByText('Descargar', { exact: true }).click();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: `Descargar el resultado en ${name}` }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(new RegExp(`^cuadre-.+\\.${fmt}$`));
    const fs = await import('node:fs');
    const path = await download.path();
    expect(fs.readFileSync(path).subarray(0, sig.length).toString()).toBe(sig);
    const out = process.env['DOCS_OUT'];
    if (out) fs.copyFileSync(path, `${out}/sample.${fmt}`);
  });
}
