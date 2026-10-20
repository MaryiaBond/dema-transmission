import { expect, test } from '@playwright/test';

test('ships an installable manifest and registers the service worker', async ({ page }) => {
  await page.goto('/?lang=en', { waitUntil: 'domcontentloaded' });
  const manifest = await page.evaluate(async () => {
    const href = document.querySelector<HTMLLinkElement>('link[rel="manifest"]')?.href;
    return href ? await fetch(href).then((response) => response.json()) : null;
  });
  expect(manifest).toMatchObject({ name: 'THE OUTSIDE', short_name: 'THE OUTSIDE', start_url: '/', scope: '/', display: 'standalone' });
  expect(manifest.icons).toEqual(expect.arrayContaining([
    expect.objectContaining({ sizes: '192x192' }),
    expect.objectContaining({ sizes: '512x512' }),
    expect.objectContaining({ purpose: 'maskable' })
  ]));
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.ready.then((registration) => registration.active?.state))).toBe('activated');
});

test('reopens the story and local archive while offline', async ({ page, context }) => {
  await page.goto('/?lang=en', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('#heroTitle')).toBeVisible();
  await page.locator('#archiveInvite').scrollIntoViewIfNeeded();
  await page.locator('#archiveInvite .action-primary').click({ force: true });
  await expect(page.getByTestId('archive-workspace')).toBeVisible();
  await context.setOffline(false);
});
