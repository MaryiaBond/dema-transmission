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

test('shows the install action at the page end and invokes an available Chromium prompt once', async ({ page }) => {
  await page.goto('/?lang=en', { waitUntil: 'domcontentloaded' });
  const cta = page.getByTestId('pwa-install-cta');
  await cta.scrollIntoViewIfNeeded();
  await expect(cta).toBeVisible();
  await expect(cta).toContainText('INSTALL GAME');
  await page.evaluate(() => {
    const event = new Event('beforeinstallprompt', { cancelable: true });
    Object.defineProperties(event, {
      prompt: { value: () => { (window as typeof window & { installPromptCalls?: number }).installPromptCalls = ((window as typeof window & { installPromptCalls?: number }).installPromptCalls ?? 0) + 1; } },
      userChoice: { value: Promise.resolve({ outcome: 'dismissed', platform: 'web' }) }
    });
    window.dispatchEvent(event);
  });
  await cta.getByRole('button', { name: /INSTALL GAME/ }).click();
  expect(await page.evaluate(() => (window as typeof window & { installPromptCalls?: number }).installPromptCalls)).toBe(1);
  await cta.getByRole('button', { name: /INSTALL GAME/ }).click();
  await expect(page.locator('.pwa-install-dialog')).toBeVisible();
  await page.evaluate(() => window.dispatchEvent(new Event('appinstalled')));
  await expect(page.getByTestId('pwa-install-cta')).toHaveCount(0);
});

test('shows the four-step iOS Safari installation guide when no native prompt exists', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'platform', { configurable: true, value: 'iPhone' });
    Object.defineProperty(navigator, 'maxTouchPoints', { configurable: true, value: 5 });
    Object.defineProperty(navigator, 'userAgent', { configurable: true, value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Version/18.0 Mobile/15E148 Safari/604.1' });
  });
  await page.goto('/?lang=ru', { waitUntil: 'domcontentloaded' });
  const cta = page.getByTestId('pwa-install-cta');
  await cta.scrollIntoViewIfNeeded();
  await cta.getByRole('button', { name: /УСТАНОВИТЬ ИГРУ/ }).click();
  const dialog = page.locator('.pwa-install-dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('li')).toHaveCount(4);
  await expect(dialog).toContainText('Поделиться');
  await expect(dialog).toContainText('На экран Домой');
});

test('hides the install action in standalone display mode', async ({ page }) => {
  await page.addInitScript(() => {
    const original = window.matchMedia.bind(window);
    window.matchMedia = (query: string) => query === '(display-mode: standalone)'
      ? { matches: true, media: query, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => true }
      : original(query);
  });
  await page.goto('/?lang=en', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('pwa-install-cta')).toHaveCount(0);
});
