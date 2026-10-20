import { expect, test } from '@playwright/test';
import type { Page, TestInfo } from '@playwright/test';

const demaVisualFiles = [
  'hero-archive-employee.png',
  'case-missing-members.png',
  'case-invisible-color.png',
  'case-perfect-broadcast.png',
  'mood-dema-city.png',
  'mood-cathedral.png',
  'mood-stained-glass.png',
  'mood-soviet-blocks.png',
  'mood-dema-propaganda.png',
  'mood-mcdema.png',
  'mood-archive-room.png',
  'mood-wet-streets.png',
  'mood-two-kids-rooftop.png',
  'badge-employee-021.png',
  'level01-complete.png'
] as const;

const completeFixture = {
  version: 1,
  playerId: 'e2e-archivist',
  employeeId: 'EMPLOYEE 021', employeeStatus: 'active', firstEnteredAt: '2026-10-19T12:00:00.000Z', onboardingCompletedAt: '2026-10-19T12:01:00.000Z',
  currentPhase: 'phase_a',
  unlockedCases: ['case_001', 'case_002', 'case_003'],
  completedCases: ['case_001', 'case_002', 'case_003'],
  discoveredEvidence: ['founding_lineup', 'salih_departure', 'dun_arrival', 'thomas_departure', 'yellow_petals', 'yellow_tape', 'bishop_vision', 'sai_broadcast', 'scaled_anagram', 'clancy_captive'],
  confirmedConnections: ['lineup_transition', 'yellow_signal', 'yellow_blindspot', 'broadcast_contradiction', 'anagram_confirmation'],
  studiedDocumentIds: ['doc_001_roster', 'doc_001_changes', 'doc_001_photo', 'doc_002_visual', 'doc_002_field', 'doc_002_directive', 'doc_003_program', 'doc_003_cipher', 'doc_003_testimony'],
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

async function openCaseOneBoard(page: import('@playwright/test').Page) {
  await openArchive(page);
  const documents = page.locator('.archive-document-list>button');
  for (let index = 0; index < 3; index += 1) await documents.nth(index).click();
  await page.locator('.archive-tabs button').filter({ hasText: 'BOARD' }).click();
  await expect(page.getByTestId('investigation-board')).toBeVisible();
}

async function timelineIds(page: Page): Promise<string[]> {
  return page.getByTestId('timeline-board').locator('.timeline-card').evaluateAll((items) => items.map((item) => (item as HTMLElement).dataset.evidence ?? ''));
}

async function mouseDragTimeline(page: Page, fromIndex: number, toIndex: number): Promise<void> {
  const cards = page.getByTestId('timeline-board').locator('.timeline-card');
  await page.getByTestId('timeline-board').locator('.timeline-sortable').scrollIntoViewIfNeeded();
  const source = await cards.nth(fromIndex).locator('.timeline-drag-handle').boundingBox();
  const target = await cards.nth(toIndex).boundingBox();
  if (!source || !target) throw new Error('Timeline drag target is outside the viewport');
  await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
  await page.mouse.down();
  await page.mouse.move(target.x + target.width / 2, target.y + target.height * (toIndex > fromIndex ? 0.85 : 0.15), { steps: 12 });
  await page.mouse.up();
}

async function touchDragTimeline(page: Page, fromIndex: number, toIndex: number): Promise<void> {
  const cards = page.getByTestId('timeline-board').locator('.timeline-card');
  await page.getByTestId('timeline-board').locator('.timeline-sortable').scrollIntoViewIfNeeded();
  if (toIndex === 0) await page.locator('.archive-main').evaluate((element) => { element.scrollTop = Math.max(0, element.scrollTop - 90); });
  const source = await cards.nth(fromIndex).locator('.timeline-drag-handle').boundingBox();
  const target = await cards.nth(toIndex).boundingBox();
  if (!source || !target) throw new Error('Timeline touch target is outside the viewport');
  const client = await page.context().newCDPSession(page);
  const start = { x: source.x + source.width / 2, y: source.y + source.height / 2 };
  const end = { x: target.x + target.width / 2, y: toIndex > fromIndex ? target.y + target.height + 12 : target.y - 12 };
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...start, radiusX: 8, radiusY: 8, force: 1 }] });
  await page.waitForTimeout(220);
  for (let step = 1; step <= 10; step += 1) {
    await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: start.x + (end.x - start.x) * step / 10, y: start.y + (end.y - start.y) * step / 10, radiusX: 8, radiusY: 8, force: 1 }] });
    await page.waitForTimeout(30);
  }
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await client.detach();
}

async function dragTimeline(page: Page, fromIndex: number, toIndex: number, testInfo: TestInfo): Promise<void> {
  if (testInfo.project.name === 'desktop') await mouseDragTimeline(page, fromIndex, toIndex);
  else await touchDragTimeline(page, fromIndex, toIndex);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/?lang=en', { waitUntil: 'domcontentloaded' });
});

test('serves every DEMA visual and keeps the image fallback stable', async ({ page, request }) => {
  for (const fileName of demaVisualFiles) {
    const response = await request.get(`/assets/dema/${fileName}`);
    expect(response.status(), fileName).toBe(200);
    expect(response.headers()['content-type'], fileName).toContain('image/png');
  }

  await page.locator('#archiveInvite').scrollIntoViewIfNeeded();
  await page.locator('#archiveInvite .action-primary').click();
  const hero = page.getByTestId('archive-onboarding').locator('.atmosphere-image');
  await expect(hero).toHaveClass(/is-loaded/);
  const reservedHeight = await hero.evaluate((element) => element.getBoundingClientRect().height);
  await hero.locator('img').evaluate((image) => { (image as HTMLImageElement).src = '/assets/dema/missing-visual.png'; });
  await expect(hero).toHaveClass(/is-missing/);
  await expect.poll(() => hero.evaluate((element) => element.getBoundingClientRect().height)).toBe(reservedHeight);
});

test('shows DEMA interference, preserves progress, and accepts the next valid connection', async ({ page }) => {
  await openCaseOneBoard(page);
  const storedBefore = await page.evaluate(() => localStorage.getItem('the-outside-archive-progress-v1'));

  await page.locator('.evidence-card[data-evidence="founding_lineup"]').click();
  await page.locator('.evidence-card[data-evidence="salih_departure"]').click();
  await page.getByRole('button', { name: 'CONNECT' }).click();

  const board = page.getByTestId('investigation-board');
  await expect(board).toHaveAttribute('data-feedback', 'wrong');
  await expect(board.locator('[data-connection-state="wrong"]')).toHaveCount(2);
  await expect(board.locator('.connection-feedback')).toContainText('DEMA SYSTEM // INTERFERENCE DETECTED');
  await expect(board.locator('.connection-feedback')).toContainText('Progress saved. Try matching different materials.');
  expect(await page.evaluate(() => localStorage.getItem('the-outside-archive-progress-v1'))).toBe(storedBefore);

  await page.locator('.evidence-card[data-evidence="founding_lineup"]').click();
  await page.locator('.evidence-card[data-evidence="thomas_departure"]').click();
  await page.getByRole('button', { name: 'CONNECT' }).click();

  await expect(board).toHaveAttribute('data-feedback', 'correct');
  await expect(board.locator('[data-connection-state="correct"]')).toHaveCount(2);
  await expect(board.locator('.bandito-link')).toBeVisible();
  await expect(board.locator('.connection-feedback')).toContainText('CONNECTION RESTORED // SIGNAL RECEIVED');
  await expect(board.locator('.contradiction-log')).toContainText('archive concealed the transition');
});

test('removes connection motion for reduced-motion and clears feedback when the case changes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate((fixture) => localStorage.setItem('the-outside-archive-progress-v1', JSON.stringify(fixture)), completeFixture);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await openArchive(page);
  await page.locator('.archive-tabs button').filter({ hasText: 'BOARD' }).click();
  await page.locator('.evidence-card[data-evidence="founding_lineup"]').click();
  await page.locator('.evidence-card[data-evidence="salih_departure"]').click();
  await page.getByRole('button', { name: 'CONNECT' }).click();

  const rejected = page.locator('[data-connection-state="wrong"]').first();
  await expect(rejected).toBeVisible();
  expect(await rejected.evaluate((element) => getComputedStyle(element).animationName)).toBe('none');
  expect(await rejected.evaluate((element) => getComputedStyle(element).transform)).toBe('none');
  const timelineHandle = page.getByTestId('timeline-board').locator('.timeline-drag-handle').first();
  await timelineHandle.focus();
  await page.keyboard.press('Space');
  const reducedTimelineCard = page.getByTestId('timeline-board').locator('.timeline-card').first();
  expect(await reducedTimelineCard.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe('0s');
  expect(await reducedTimelineCard.evaluate((element) => getComputedStyle(element).transform)).toBe('none');
  await page.keyboard.press('Escape');

  await page.locator('.archive-case-rail button').filter({ hasText: 'INVISIBLE COLOR' }).click();
  await page.locator('.archive-tabs button').filter({ hasText: 'BOARD' }).click();
  const nextBoard = page.getByTestId('investigation-board');
  await expect(nextBoard).toHaveAttribute('data-feedback', 'idle');
  await expect(nextBoard.locator('[data-connection-state]')).toHaveCount(0);
  await expect(nextBoard.locator('.connection-feedback')).toHaveCount(0);
});

test('reorders the timeline across arbitrary and adjacent positions and persists it', async ({ page }, testInfo) => {
  await openCaseOneBoard(page);
  const initial = ['dun_arrival', 'founding_lineup', 'thomas_departure', 'salih_departure'];
  await expect.poll(() => timelineIds(page)).toEqual(initial);
  await expect(page.getByTestId('timeline-board').getByRole('button', { name: /Move earlier|Move later/ })).toHaveCount(0);

  if (testInfo.project.name === 'desktop') {
    await dragTimeline(page, 0, 3, testInfo);
    await expect.poll(() => timelineIds(page)).toEqual(['founding_lineup', 'thomas_departure', 'salih_departure', 'dun_arrival']);
    await dragTimeline(page, 1, 2, testInfo);
    await expect.poll(() => timelineIds(page)).toEqual(['founding_lineup', 'salih_departure', 'thomas_departure', 'dun_arrival']);
  } else {
    await dragTimeline(page, 3, 0, testInfo);
    await expect.poll(() => timelineIds(page)).toEqual(['salih_departure', 'dun_arrival', 'founding_lineup', 'thomas_departure']);
    await page.waitForTimeout(500);
    await dragTimeline(page, 1, 2, testInfo);
    await expect.poll(() => timelineIds(page)).toEqual(['salih_departure', 'founding_lineup', 'dun_arrival', 'thomas_departure']);
  }
  const persisted = await timelineIds(page);
  await expect(page.getByTestId('timeline-board')).toContainText('SEQUENCE UPDATED');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await openArchive(page);
  await page.locator('.archive-tabs button').filter({ hasText: 'BOARD' }).click();
  await expect.poll(() => timelineIds(page)).toEqual(persisted);
});

test('supports keyboard timeline sorting without visible arrow controls', async ({ page }) => {
  await openCaseOneBoard(page);
  const handle = page.getByTestId('timeline-board').locator('.timeline-drag-handle').first();
  await handle.focus();
  await page.keyboard.press('Space');
  await expect(handle).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Space');
  await expect.poll(() => timelineIds(page)).toEqual(['founding_lineup', 'dun_arrival', 'thomas_departure', 'salih_departure']);
  await expect(page.getByTestId('timeline-board')).toContainText('SEQUENCE UPDATED');
});

test('clears drag visuals when switching cases while preserving the saved order', async ({ page }, testInfo) => {
  await page.evaluate((fixture) => localStorage.setItem('the-outside-archive-progress-v1', JSON.stringify(fixture)), completeFixture);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await openArchive(page);
  await page.locator('.archive-tabs button').filter({ hasText: 'BOARD' }).click();
  await dragTimeline(page, 0, 2, testInfo);
  const reordered = await timelineIds(page);
  await page.locator('.archive-case-rail button').filter({ hasText: 'INVISIBLE COLOR' }).click();
  await expect(page.locator('.timeline-chosen, .timeline-dragging, .timeline-drop-target')).toHaveCount(0);
  await page.locator('.archive-case-rail button').filter({ hasText: 'MISSING MEMBERS' }).click();
  await page.locator('.archive-tabs button').filter({ hasText: 'BOARD' }).click();
  await expect.poll(() => timelineIds(page)).toEqual(reordered);
});

test('keeps touch scrolling available outside the timeline handle', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'desktop', 'Touch scrolling is covered by mobile projects.');
  await openCaseOneBoard(page);
  const card = page.getByTestId('timeline-board').locator('.timeline-card').first();
  await card.scrollIntoViewIfNeeded();
  const event = await card.locator('.timeline-event').boundingBox();
  if (!event) throw new Error('Timeline event is outside the viewport');
  const before = await page.locator('.archive-main').evaluate((element) => element.scrollTop);
  const client = await page.context().newCDPSession(page);
  const x = event.x + event.width / 2;
  const startY = event.y + event.height / 2;
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: startY, radiusX: 8, radiusY: 8, force: 1 }] });
  await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: startY - 90, radiusX: 8, radiusY: 8, force: 1 }] });
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await client.detach();
  await expect.poll(() => page.locator('.archive-main').evaluate((element) => element.scrollTop)).toBeGreaterThan(before);
  await expect.poll(() => timelineIds(page)).toEqual(['dun_arrival', 'founding_lineup', 'thomas_departure', 'salih_departure']);
});

test('enters the archive, solves CASE 001, and earns its achievement', async ({ page }, testInfo) => {
  await openArchive(page);
  const documents = page.locator('.archive-document-list>button');
  await expect(documents).toHaveCount(3);
  for (let index = 0; index < 3; index += 1) await documents.nth(index).click();
  await expect(page.getByTestId('document-viewer')).toBeVisible();

  await page.locator('.archive-tabs button').filter({ hasText: 'BOARD' }).click();
  await page.locator('.evidence-card[data-evidence="founding_lineup"]').click();
  await page.locator('.evidence-card[data-evidence="thomas_departure"]').click();
  await page.getByRole('button', { name: 'CONNECT' }).click();
  await expect(page.locator('.contradiction-log')).toContainText('transition');

  await expect(page.getByTestId('case-progress-checklist')).toContainText('PENDING');
  await expect(page.getByRole('button', { name: 'FILE CASE' })).toBeDisabled();
  await dragTimeline(page, 1, 0, testInfo);
  await dragTimeline(page, 3, 1, testInfo);
  await expect.poll(() => timelineIds(page)).toEqual(['founding_lineup', 'salih_departure', 'dun_arrival', 'thomas_departure']);
  await expect(page.getByRole('button', { name: 'FILE CASE' })).toBeDisabled();
  await page.locator('.archive-tabs button').filter({ hasText: 'RECORDS' }).click();
  const records = page.locator('.archive-music-record');
  await expect(records).toHaveCount(3);
  for (let index = 0; index < 3; index += 1) await records.nth(index).getByRole('button', { name: 'MARK AS STUDIED' }).click();
  await expect(page.getByTestId('case-progress-checklist')).toContainText('100%');
  await expect(page.getByRole('button', { name: 'FILE CASE' })).toBeEnabled();
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
