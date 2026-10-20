import { describe, expect, it } from 'vitest';
import { CYCLE_LIMIT, completeCurrentCycle, currentCycle, localDayKey, restoreExperience, serializeExperience } from '@/features/story-cycle/cycle-engine';

describe('Cycle Engine', () => {
  it('advances sequentially and stops after cycle 21', () => {
    let completed = 0;
    for (let cycle = 1; cycle <= CYCLE_LIMIT; cycle += 1) completed = completeCurrentCycle(completed, cycle);
    expect(completed).toBe(21);
    expect(currentCycle(completed)).toBe(21);
    expect(completeCurrentCycle(completed, 22)).toBe(21);
  });

  it('rejects skipped and repeated completions', () => {
    expect(completeCurrentCycle(0, 2)).toBe(0);
    expect(completeCurrentCycle(3, 3)).toBe(3);
    expect(completeCurrentCycle(3, 4)).toBe(4);
  });

  it('restores the legacy state and resets on a new local date', () => {
    const legacy = { date: '2026-10-19', completed: 7, initialLanguage: 'be', manualOverride: 'es' };
    expect(restoreExperience(legacy, '2026-10-19', 'ru')).toMatchObject({ completedCycles: 7, initialLanguage: 'be', languageOverride: 'es' });
    expect(restoreExperience(legacy, '2026-10-20', 'en')).toMatchObject({ completedCycles: 0, initialLanguage: 'en', languageOverride: null });
  });

  it('serializes a versioned state and uses local calendar dates', () => {
    const state = { date: '2026-10-19', completedCycles: 2, initialLanguage: 'ru' as const, selectedLanguage: 'ru' as const, languageOverride: null };
    expect(serializeExperience(state).version).toBe(2);
    expect(localDayKey(new Date(2026, 9, 19, 23, 59))).toBe('2026-10-19');
  });
});
