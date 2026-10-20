import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { CYCLE_STORAGE_KEY, LANGUAGE_STORAGE_KEY, completeCurrentCycle, currentCycle as calculateCurrentCycle, isEndingUnlocked, localDayKey, restoreExperience, serializeExperience } from '@/features/story-cycle/cycle-engine';
import type { LanguageCode } from '@/types/content';

function isLanguage(value: unknown): value is LanguageCode {
  return value === 'ru' || value === 'be' || value === 'en' || value === 'es';
}

function browserLanguage(): LanguageCode {
  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const candidate of candidates) {
    const short = String(candidate ?? '').toLowerCase().split('-')[0];
    if (isLanguage(short)) return short;
  }
  return 'ru';
}

function requestedLanguage(): LanguageCode | null {
  try {
    const candidate = new URL(window.location.href).searchParams.get('lang');
    return isLanguage(candidate) ? candidate : null;
  } catch { return null; }
}

function storedLanguage(): LanguageCode | null {
  try {
    const candidate = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return isLanguage(candidate) ? candidate : null;
  } catch { return null; }
}

export const useExperienceStore = defineStore('experience', () => {
  const selectedLanguage = ref<LanguageCode>('ru');
  const initialLanguage = ref<LanguageCode>('ru');
  const completedCycles = ref(0);
  const sessionDate = ref(localDayKey());
  const languageOverride = ref<LanguageCode | null>(null);
  const currentChapter = ref(0);

  const currentCycle = computed(() => currentCycleValue());
  const endingUnlocked = computed(() => isEndingUnlocked(completedCycles.value));
  function currentCycleValue(): number { return calculateCurrentCycle(completedCycles.value); }

  function persist(): void {
    try {
      localStorage.setItem(CYCLE_STORAGE_KEY, JSON.stringify(serializeExperience({
        date: sessionDate.value,
        completedCycles: completedCycles.value,
        initialLanguage: initialLanguage.value,
        selectedLanguage: selectedLanguage.value,
        languageOverride: languageOverride.value
      })));
      localStorage.setItem(LANGUAGE_STORAGE_KEY, selectedLanguage.value);
    } catch { /* The experience remains fully functional in memory. */ }
  }

  function hydrate(): void {
    const preferred = requestedLanguage() ?? storedLanguage() ?? browserLanguage();
    let raw: unknown = null;
    try { raw = JSON.parse(localStorage.getItem(CYCLE_STORAGE_KEY) ?? 'null'); } catch { raw = null; }
    const restored = restoreExperience(raw, localDayKey(), preferred);
    sessionDate.value = restored.date;
    completedCycles.value = restored.completedCycles;
    initialLanguage.value = restored.initialLanguage;
    selectedLanguage.value = requestedLanguage() ?? restored.selectedLanguage ?? preferred;
    languageOverride.value = restored.languageOverride;
    persist();
  }

  function selectLanguage(language: LanguageCode, manual = true): void {
    selectedLanguage.value = language;
    if (manual) {
      languageOverride.value = language;
      if (!initialLanguage.value) initialLanguage.value = language;
    }
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('lang', language);
      history.replaceState(history.state, '', url.href);
    } catch { /* file:// and privacy modes may reject history changes. */ }
    persist();
  }

  function finishCycle(cycle: number): boolean {
    const next = completeCurrentCycle(completedCycles.value, cycle);
    if (next === completedCycles.value) return false;
    completedCycles.value = next;
    persist();
    return true;
  }

  function resetForNewDay(now = new Date()): boolean {
    const today = localDayKey(now);
    if (today === sessionDate.value) return false;
    sessionDate.value = today;
    completedCycles.value = 0;
    initialLanguage.value = selectedLanguage.value;
    languageOverride.value = null;
    currentChapter.value = 0;
    persist();
    return true;
  }

  return {
    selectedLanguage, initialLanguage, currentCycle, completedCycles, sessionDate,
    languageOverride, endingUnlocked, currentChapter,
    hydrate, selectLanguage, finishCycle, resetForNewDay, persist
  };
});
