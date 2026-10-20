import type { LanguageCode } from './content';

export interface PersistedExperienceV2 {
  version: 2;
  date: string;
  completedCycles: number;
  initialLanguage: LanguageCode;
  selectedLanguage: LanguageCode;
  languageOverride: LanguageCode | null;
}

export interface ExperienceSnapshot {
  date: string;
  completedCycles: number;
  initialLanguage: LanguageCode;
  selectedLanguage: LanguageCode;
  languageOverride: LanguageCode | null;
}
