import { createI18n } from 'vue-i18n';
import { localeContent } from '@/content/locales';
import { citizenshipLocales } from '@/content/citizenship-locales';
import type { LanguageCode } from '@/types/content';

function messages(language: LanguageCode) {
  const content = localeContent[language];
  return {
    ui: {
      skip: content.ui.skip,
      brandAria: content.ui.brandAria,
      brandTagline: content.ui.brandTagline,
      here: content.ui.here,
      modeAria: content.ui.modeAria,
      menuOpen: content.ui.menuOpen,
      menuClose: content.ui.menuClose,
      mobileNav: content.ui.mobileNav,
      mobileArchive: content.ui.mobileArchive,
      language: content.ui.language,
      languageMenu: content.ui.languageMenu,
      close: content.ui.close,
      railAria: content.ui.railAria,
      railStatus: content.ui.railStatus,
      chapters: content.ui.chapters,
      mobileChapters: content.ui.mobileChapters
    },
    glossary: content.glossaryUi,
    citizenship: citizenshipLocales[language]
  };
}

export const i18n = createI18n({
  legacy: false,
  locale: 'ru',
  fallbackLocale: 'ru',
  messages: { ru: messages('ru'), be: messages('be'), en: messages('en'), es: messages('es') }
});
