import type { ExperienceSnapshot, PersistedExperienceV2 } from '@/types/experience';
import type { LanguageCode } from '@/types/content';

export const CYCLE_LIMIT = 21;
export const CYCLE_STORAGE_KEY = 'the-outside-cycle-progress';
export const LANGUAGE_STORAGE_KEY = 'the-outside-language';

export function localDayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function clampCompleted(value: unknown): number {
  return Number.isInteger(value) ? Math.max(0, Math.min(CYCLE_LIMIT, value as number)) : 0;
}

export function currentCycle(completedCycles: number): number {
  return Math.min(CYCLE_LIMIT, Math.max(1, clampCompleted(completedCycles) + 1));
}

export function isEndingUnlocked(completedCycles: number): boolean {
  return clampCompleted(completedCycles) >= CYCLE_LIMIT;
}

export function completeCurrentCycle(completedCycles: number, cycle: number): number {
  const completed = clampCompleted(completedCycles);
  if (cycle !== completed + 1 || cycle > CYCLE_LIMIT) return completed;
  return Math.min(CYCLE_LIMIT, cycle);
}

function language(value: unknown, fallback: LanguageCode): LanguageCode {
  return value === 'ru' || value === 'be' || value === 'en' || value === 'es' ? value : fallback;
}

export function restoreExperience(raw: unknown, today: string, fallbackLanguage: LanguageCode): ExperienceSnapshot {
  const reset: ExperienceSnapshot = {
    date: today,
    completedCycles: 0,
    initialLanguage: fallbackLanguage,
    selectedLanguage: fallbackLanguage,
    languageOverride: null
  };
  if (!raw || typeof raw !== 'object') return reset;
  const source = raw as Record<string, unknown>;
  if (source.date !== today) return reset;

  // The former static build stored { date, completed, initialLanguage, manualOverride }.
  const completed = source.version === 2 ? source.completedCycles : source.completed;
  const selected = language(source.selectedLanguage, fallbackLanguage);
  const initial = language(source.initialLanguage, selected);
  const overrideValue = source.version === 2 ? source.languageOverride : source.manualOverride;
  const override = overrideValue == null ? null : language(overrideValue, selected);
  return {
    date: today,
    completedCycles: clampCompleted(completed),
    initialLanguage: initial,
    selectedLanguage: selected,
    languageOverride: override
  };
}

export function serializeExperience(snapshot: ExperienceSnapshot): PersistedExperienceV2 {
  return { version: 2, ...snapshot };
}
