import { describe, expect, it } from 'vitest';
import { chapters } from '@/content/chapters';
import { glossaryIds } from '@/content/glossary';
import { localeContent, supportedLanguages } from '@/content/locales';

describe('localized content', () => {
  it('contains four complete dictionaries with matching structures', () => {
    const baseline = localeContent.ru;
    for (const language of supportedLanguages) {
      const candidate = localeContent[language];
      expect(Object.keys(candidate)).toEqual(Object.keys(baseline));
      expect(Object.keys(candidate.ui)).toEqual(Object.keys(baseline.ui));
      expect(Object.keys(candidate.hero)).toEqual(Object.keys(baseline.hero));
      expect(Object.keys(candidate.origin)).toEqual(Object.keys(baseline.origin));
      expect(Object.keys(candidate.cycle)).toEqual(Object.keys(baseline.cycle));
      expect(Object.keys(candidate.archive)).toEqual(Object.keys(baseline.archive));
      expect(candidate.chapters).toHaveLength(baseline.chapters.length);
      candidate.chapters.slice(1).forEach((chapter, index) => expect(Object.keys(chapter ?? {})).toEqual(Object.keys(baseline.chapters[index + 1] ?? {})));
      expect(localeContent[language].playlist).toHaveLength(12);
      expect(glossaryIds.every((id) => Boolean(localeContent[language].glossary[id]))).toBe(true);
    }
  });

  it('keeps a language-independent structure and stable unique block IDs', () => {
    const ids = chapters.flatMap((chapter) => chapter.narrativeBlockIds);
    expect(chapters.map((chapter) => chapter.number)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(new Set(ids).size).toBe(ids.length);
    for (const language of supportedLanguages) {
      expect(localeContent[language].origin.prose).toHaveLength(5);
      expect(localeContent[language].chapters[1]?.narrative).toHaveLength(4);
      for (let chapter = 2; chapter <= 6; chapter += 1) expect(localeContent[language].chapters[chapter]?.narrative).toHaveLength(5);
    }
  });

  it('contains no HTML strings in the normalized locale data', () => {
    const visit = (value: unknown): void => {
      if (typeof value === 'string') expect(value).not.toMatch(/<\/?(?:p|span|strong|em|button|a|div|h2)\b/i);
      else if (Array.isArray(value)) value.forEach(visit);
      else if (value && typeof value === 'object') Object.values(value).forEach(visit);
    };
    supportedLanguages.forEach((language) => visit(localeContent[language]));
  });
});
