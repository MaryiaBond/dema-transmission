import be from './be';
import en from './en';
import es from './es';
import ru from './ru';
import type { LanguageCode, LocalizedContent } from '@/types/content';

export const localeContent: Record<LanguageCode, LocalizedContent> = { ru, be, en, es };
export const supportedLanguages: LanguageCode[] = ['ru', 'be', 'es', 'en'];

export function getLocaleContent(language: LanguageCode): LocalizedContent {
  return localeContent[language];
}
