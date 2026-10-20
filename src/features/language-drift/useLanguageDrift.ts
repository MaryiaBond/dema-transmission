import { getBlockLanguage } from './drift-engine';
import { useExperienceStore } from '@/stores/experience';
import type { LanguageCode } from '@/types/content';

export function useLanguageDrift() {
  const store = useExperienceStore();
  function languageFor(blockId: string, cycle: number, priority = 3): LanguageCode {
    return getBlockLanguage({
      initialLanguage: store.initialLanguage,
      cycle,
      blockId,
      manualOverride: store.languageOverride,
      priority
    });
  }
  return { languageFor };
}
