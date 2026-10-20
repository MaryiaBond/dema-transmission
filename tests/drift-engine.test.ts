import { describe, expect, it } from 'vitest';
import { getBlockLanguage, getLanguagePhase, LANGUAGE_ORDER } from '@/features/language-drift/drift-engine';

describe('Language Drift Engine', () => {
  it('hits every full-language phase and returns to the initial language', () => {
    expect(getLanguagePhase('ru', 1)).toMatchObject({ source: 'ru', progress: 0 });
    expect(getLanguagePhase('ru', 6)).toMatchObject({ source: 'be', progress: 0 });
    expect(getLanguagePhase('ru', 11)).toMatchObject({ source: 'en', progress: 0 });
    expect(getLanguagePhase('ru', 16)).toMatchObject({ source: 'es', progress: 0 });
    expect(getLanguagePhase('ru', 21)).toMatchObject({ source: 'ru', target: 'ru', progress: 0 });
  });

  it('rotates correctly from every possible initial language', () => {
    for (const initial of LANGUAGE_ORDER) {
      const index = LANGUAGE_ORDER.indexOf(initial);
      expect(getLanguagePhase(initial, 6).source).toBe(LANGUAGE_ORDER[(index + 1) % 4]);
      expect(getLanguagePhase(initial, 11).source).toBe(LANGUAGE_ORDER[(index + 2) % 4]);
      expect(getLanguagePhase(initial, 16).source).toBe(LANGUAGE_ORDER[(index + 3) % 4]);
      expect(getLanguagePhase(initial, 21).source).toBe(initial);
    }
  });

  it('is deterministic, cumulative inside a phase, and honors manual override', () => {
    const blocks = Array.from({ length: 250 }, (_, index) => `trench.block.${index}`);
    const selected = (cycle: number) => new Set(blocks.filter((blockId) => getBlockLanguage({ initialLanguage: 'ru', cycle, blockId }) === 'be'));
    const cycle2 = selected(2);
    const cycle5 = selected(5);
    expect([...cycle2].every((block) => cycle5.has(block))).toBe(true);
    expect(getBlockLanguage({ initialLanguage: 'ru', cycle: 9, blockId: 'stable', manualOverride: 'es' })).toBe('es');
    expect(getBlockLanguage({ initialLanguage: 'ru', cycle: 4, blockId: 'stable' })).toBe(getBlockLanguage({ initialLanguage: 'ru', cycle: 4, blockId: 'stable' }));
  });
});
