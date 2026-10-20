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
  await expect(page.locator('.story-cycle')).toHaveCount(2);
  expect(errors).toEqual([]);
});

test('switches all languages without moving the reading anchor', async ({ page }) => {
  await page.locator('#cycle-1-chapter-2').scrollIntoViewIfNeeded();
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
  await page.locator('#cycle-1-chapter-1 .term').first().click();
  await expect(page.locator('.term-dialog')).toBeVisible();
  await page.locator('.language-button').dispatchEvent('click');
  await page.locator('[data-language="en"]').dispatchEvent('click');
  await expect(page.locator('.term-dialog')).toBeVisible();
  await page.locator('.term-dialog .dialog-close').click();
  await page.locator('#archiveInvite .action-primary').click();
  await expect(page.locator('.archive-dialog')).toBeVisible();
  await page.locator('.archive-dialog .dialog-close').click();
  await page.locator('#cycle-1-chapter-6 .spoiler-button').click();
  await expect(page.locator('#cycle-1-spoiler-content')).toBeVisible();
});

test('keeps external music URLs and exposes the final state without a 22nd cycle', async ({ page }) => {
  await expect(page.locator('[data-service="spotify"]').first()).toHaveAttribute('href', /^https:\/\/open\.spotify\.com\//);
  await expect(page.locator('[data-service="yandex"]').first()).toHaveAttribute('href', /^https:\/\/music\.yandex\.ru\//);
  await page.evaluate(() => localStorage.setItem('the-outside-cycle-progress', JSON.stringify({ version: 2, date: new Date().toLocaleDateString('en-CA'), completedCycles: 21, initialLanguage: 'ru', selectedLanguage: 'ru', languageOverride: null })));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('.story-cycle[data-cycle="21"]')).toHaveCount(1);
  await expect(page.locator('.story-cycle[data-cycle="22"]')).toHaveCount(0);
  await expect(page.locator('.cycle-terminal')).toBeAttached();
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
