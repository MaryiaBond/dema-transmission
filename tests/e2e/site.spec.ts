import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/?lang=ru', { waitUntil: 'domcontentloaded' });
});

test('opens without console errors and preserves the responsive layout', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await expect(page.locator('#heroTitle')).toBeVisible();
  if (testInfo.project.name === 'desktop') await expect(page.locator('.chapter-rail')).toBeVisible();
  else await expect(page.locator('.chapter-rail')).toBeHidden();
  await expect(page.locator('.story-sequence')).toHaveCount(1);
  await expect(page.locator('.chapter')).toHaveCount(7);
  expect(errors).toEqual([]);
});

test('switches all languages without moving the reading anchor', async ({ page }) => {
  await page.locator('#chapter-2').scrollIntoViewIfNeeded();
  const before = await page.evaluate(() => window.scrollY);
  for (const code of ['be', 'es', 'en', 'ru']) {
    await page.locator('.language-button').click();
    await page.locator(`[data-language="${code}"]`).click();
    await page.waitForTimeout(70);
    await expect(page.locator('html')).toHaveAttribute('lang', code);
  }
  const after = await page.evaluate(() => window.scrollY);
  expect(Math.abs(after - before)).toBeLessThan(3);
});

test('keeps glossary, archive, and spoiler state reactive', async ({ page }) => {
  await page.locator('#chapter-1 .term').first().click();
  await expect(page.locator('.term-dialog')).toBeVisible();
  await page.locator('.language-button').dispatchEvent('click');
  await page.locator('[data-language="en"]').dispatchEvent('click');
  await expect(page.locator('.term-dialog')).toBeVisible();
  await page.locator('.term-dialog .dialog-close').click();
  await page.locator('#archiveInvite .action-primary').click();
  await expect(page.locator('.archive-dialog')).toBeVisible();
  await page.locator('.archive-dialog .dialog-close').click();
  await page.locator('#chapter-6 .spoiler-button').click();
  await expect(page.locator('#story-spoiler-content')).toBeVisible();
});

test('keeps compact external music links and ends after the seventh chapter', async ({ page }) => {
  await expect(page.locator('[data-service="spotify"]').first()).toHaveAttribute('href', /^https:\/\/open\.spotify\.com\//);
  await expect(page.locator('[data-service="yandex"]').first()).toHaveAttribute('href', /^https:\/\/music\.yandex\.ru\//);
  await expect(page.locator('[data-service="youtube"]').first()).toHaveAttribute('href', /^https:\/\/(?:www\.)?youtube\.com\//);
  const watchButtons = page.locator('.watch-row').first().locator('.watch-buttons a');
  await expect(watchButtons).toHaveCount(3);
  const geometry = await watchButtons.evaluateAll((buttons) => buttons.map((button) => {
    const box = button.getBoundingClientRect();
    const icon = button.querySelector('.service-icon')!.getBoundingClientRect();
    return { height: box.height, iconWidth: icon.width, iconHeight: icon.height };
  }));
  expect(geometry.every(({ height }) => height >= 44)).toBe(true);
  expect(geometry.every(({ iconWidth, iconHeight }) => iconWidth >= 18 && iconWidth <= 20 && iconHeight >= 18 && iconHeight <= 20)).toBe(true);
  await expect(watchButtons.nth(0).locator('img')).toHaveAttribute('src', '/assets/youtube.svg');
  expect(await page.locator('.watch-row').first().locator('.watch-buttons').evaluate((buttons) => buttons.scrollWidth - buttons.clientWidth)).toBeLessThanOrEqual(1);
  await page.evaluate(() => localStorage.setItem('the-outside-cycle-progress', '{legacy-cycle-data'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('#chapter-6').scrollIntoViewIfNeeded();
  await expect(page.locator('.chapter')).toHaveCount(7);
  await expect(page.locator('.cycle-terminal, .cycle-finale, [data-cycle-complete-sentinel]')).toHaveCount(0);
  await expect(page.getByTestId('pwa-install-cta')).toBeVisible();
});

test('navigates directly between story chapters without a cycle number', async ({ page }, testInfo) => {
  if (testInfo.project.name === 'desktop') await page.locator('.chapter-rail a[href="#chapter-4"]').click();
  else {
    await page.locator('.menu-button').click();
    await page.locator('.mobile-menu a[href="#chapter-4"]').click();
  }
  await expect(page).toHaveURL(/#chapter-4$/);
  await expect(page.locator('#chapter-4')).toBeInViewport();
  await page.locator('#chapter-4 .chapter-tail a').click();
  await expect(page).toHaveURL(/#chapter-5$/);
});

test('keeps archive progress untouched while reading to the end of the story', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('the-outside-archive-progress-v1', 'archive-progress-sentinel'));
  const before = await page.evaluate(() => localStorage.getItem('the-outside-archive-progress-v1'));
  expect(before).not.toBeNull();
  await page.locator('#chapter-6').scrollIntoViewIfNeeded();
  await page.getByTestId('pwa-install-cta').scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => localStorage.getItem('the-outside-archive-progress-v1'))).toBe(before);
});

test('has no horizontal overflow on mobile', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('mobile'));
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.locator('.menu-button').click();
  await expect(page.locator('.mobile-menu')).toHaveClass(/open/);
});

test('keeps citizenship optional when OAuth keys are absent', async ({ page }) => {
  await expect(page.locator('#heroTitle')).toBeVisible();
  await page.locator('#citizenship').scrollIntoViewIfNeeded();
  await expect(page.locator('#citizenship')).toBeVisible();
  await expect(page.locator('#citizenship .citizenship-action')).toBeDisabled();
  await expect(page.getByTestId('spotify-auth-unavailable')).toBeVisible();
  await expect(page.locator('[data-service="spotify"]')).not.toHaveCount(0);
});

test('localizes the citizenship invitation in all supported languages', async ({ page }) => {
  await page.locator('#citizenship').scrollIntoViewIfNeeded();
  for (const code of ['be', 'es', 'en', 'ru']) {
    await page.locator('.language-button').click();
    await page.locator(`[data-language="${code}"]`).click();
    await expect(page.locator('#citizenship-title')).not.toBeEmpty();
    await expect(page.getByTestId('spotify-auth-unavailable')).not.toBeEmpty();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  }
});
