import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { LanguageCode } from '@/types/content';

const LANGUAGE_STORAGE_KEY = 'the-outside-language';

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
  const currentChapter = ref(0);

  function persist(): void {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, selectedLanguage.value);
    } catch { /* The experience remains fully functional in memory. */ }
  }

  function hydrate(): void {
    const preferred = requestedLanguage() ?? storedLanguage() ?? browserLanguage();
    selectedLanguage.value = preferred;
    persist();
  }

  function selectLanguage(language: LanguageCode, _manual = true): void {
    selectedLanguage.value = language;
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('lang', language);
      history.replaceState(history.state, '', url.href);
    } catch { /* file:// and privacy modes may reject history changes. */ }
    persist();
  }

  return {
    selectedLanguage, currentChapter,
    hydrate, selectLanguage, persist
  };
});
