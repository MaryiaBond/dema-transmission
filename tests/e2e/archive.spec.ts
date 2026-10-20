import { expect, test } from '@playwright/test';

const completeFixture = {
  version: 1,
  playerId: 'e2e-archivist',
  employeeId: 'EMPLOYEE 021', employeeStatus: 'active', firstEnteredAt: '2026-10-19T12:00:00.000Z', onboardingCompletedAt: '2026-10-19T12:01:00.000Z',
  currentPhase: 'phase_a',
  unlockedCases: ['case_001', 'case_002', 'case_003'],
  completedCases: ['case_001', 'case_002', 'case_003'],
  discoveredEvidence: ['founding_lineup', 'salih_departure', 'dun_arrival', 'thomas_departure', 'yellow_petals', 'yellow_tape', 'bishop_vision', 'sai_broadcast', 'scaled_anagram', 'clancy_captive'],
  confirmedConnections: ['lineup_transition', 'yellow_signal', 'yellow_blindspot', 'broadcast_contradiction', 'anagram_confirmation'],
  investigatedMusicRecords: Object.fromEntries(['heavydirtysoul', 'jumpsuit', 'nico', 'levitate', 'saturday', 'outside', 'iamclancy', 'overcompensate', 'navigating'].map((musicRecordId) => [musicRecordId, { musicRecordId, visitedExternalLink: false, markedAsStudied: true, studiedAt: '2026-10-19T12:00:00.000Z' }])),
  achievements: [
    { id: 'archive_corrected', earnedAt: '2026-10-19T12:00:00.000Z' }, { id: 'invisible_color', earnedAt: '2026-10-19T12:00:00.000Z' },
    { id: 'perfect_broadcast', earnedAt: '2026-10-19T12:00:00.000Z' }, { id: 'nine_frequencies', earnedAt: '2026-10-19T12:00:00.000Z' }
  ],
  assessmentAnswers: {}, assessmentCompletedAt: null, level01CompletedAt: null, clearanceLevel: 'ARCHIVE ENTRY', caseSolutions: { case_003: 'CLANCY IS DEAD' },
  caseSequences: { case_001: ['founding_lineup', 'salih_departure', 'dun_arrival', 'thomas_departure'] },
  updatedAt: '2026-10-19T12:00:00.000Z'
};

async function openArchive(page: import('@playwright/test').Page) {
  await page.locator('#archiveInvite').scrollIntoViewIfNeeded();
  await page.locator('#archiveInvite .action-primary').click();
  await expect(page.getByTestId('archive-workspace')).toBeVisible();
  if (await page.getByTestId('archive-onboarding').isVisible()) {
    await expect(page.getByTestId('archive-onboarding')).toContainText('D//CENTRAL ARCHIVE');
    await page.getByTestId('archive-onboarding').getByRole('button').click();
    await expect(page.getByTestId('archive-onboarding')).toContainText('EMPLOYEE 021');
    await page.getByTestId('archive-onboarding').getByRole('button').click();
    await page.getByTestId('archive-onboarding').getByRole('button').click();
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto('/?lang=en', { waitUntil: 'domcontentloaded' });
});

test('enters the archive, solves CASE 001, and earns its achievement', async ({ page }) => {
  await openArchive(page);
  const documents = page.locator('.archive-document-list>button');
  await expect(documents).toHaveCount(3);
  for (let index = 0; index < 3; index += 1) await documents.nth(index).click();
  await expect(page.getByTestId('document-viewer')).toBeVisible();

  await page.locator('.archive-tabs button').filter({ hasText: 'BOARD' }).click();
  await page.locator('[data-evidence="founding_lineup"]').click();
  await page.locator('[data-evidence="thomas_departure"]').click();
  await page.getByRole('button', { name: 'CONNECT' }).click();
  await expect(page.locator('.contradiction-log')).toContainText('transition');

  const timeline = page.getByTestId('timeline-board').locator('li');
  await timeline.nth(1).getByRole('button', { name: /Move earlier/ }).click();
  await timeline.nth(3).getByRole('button', { name: /Move earlier/ }).click();
  await timeline.nth(2).getByRole('button', { name: /Move earlier/ }).click();
  await page.getByRole('button', { name: 'FILE CASE' }).click();
  await expect(page.locator('.archive-case-footer')).toContainText('ARCHIVE CORRECTED');

  await page.locator('.archive-tabs button').filter({ hasText: 'CREDENTIAL' }).click();
  await expect(page.getByTestId('achievement-passport').locator('article.earned')).toContainText('Archive Corrected');
});

test('marks a music record manually without claiming playback', async ({ page }) => {
  await openArchive(page);
  await page.locator('.archive-tabs button').filter({ hasText: 'RECORDS' }).click();
  const first = page.locator('.archive-music-record').first();
  await first.getByRole('button', { name: 'MARK AS STUDIED' }).click();
  await expect(first).toContainText('MANUALLY STUDIED');
  await expect(page.locator('.archive-record-disclaimer')).toContainText('does not verify playback');
});

test('opens and completes the cinematic compliance assessment from a test fixture', async ({ page }) => {
  await page.evaluate((fixture) => localStorage.setItem('the-outside-archive-progress-v1', JSON.stringify(fixture)), completeFixture);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await openArchive(page);
  await page.locator('.archive-tabs button').filter({ hasText: 'ASSESSMENT' }).click();
  await expect(page.getByTestId('compliance-assessment')).toBeVisible();
  for (let index = 0; index < 9; index += 1) {
    await page.locator('.compliance-options label').first().click();
    await page.locator('.compliance-question>button').click();
  }
  await expect(page.locator('.compliance-result')).toContainText('SUITABLE FOR CONTINUED OBSERVATION');
  await page.locator('.compliance-result').getByRole('button', { name: 'CONTINUE' }).click();
  await expect(page.getByTestId('level-complete-scene')).toContainText('LEVEL 01 COMPLETE');
  await page.getByRole('button', { name: 'ACCEPT CLEARANCE' }).click();
  await expect(page.getByTestId('level-complete-scene')).toContainText('💩 🦄');
  await page.getByRole('button', { name: 'REVIEW ACHIEVEMENTS' }).click();
  await expect(page.getByTestId('classified-personnel-note')).toContainText('Employee No. 021 demonstrated independent thought');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await openArchive(page);
  await page.locator('.archive-tabs button').filter({ hasText: 'CREDENTIAL' }).click();
  await expect(page.getByTestId('classified-personnel-note')).toContainText('CLASSIFIED');
});

test('renders the archive in all four explicit languages without horizontal page overflow', async ({ page }) => {
  for (const language of ['ru', 'be', 'es', 'en']) {
    await page.goto(`/?lang=${language}`, { waitUntil: 'domcontentloaded' });
    await openArchive(page);
    await expect(page.locator('html')).toHaveAttribute('lang', language);
    await expect(page.locator('.archive-case-heading h1')).not.toBeEmpty();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    await page.locator('.archive-system-bar .dialog-close').click();
  }
});

test('returns from the game to the unchanged story', async ({ page }) => {
  await openArchive(page);
  await page.locator('.archive-system-bar .dialog-close').click();
  await expect(page.locator('.archive-game-dialog')).not.toBeVisible();
  await expect(page.locator('#heroTitle')).toBeAttached();
});
