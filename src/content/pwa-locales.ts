import type { LanguageCode } from '@/types/content';

interface PwaLocale {
  installTitle: string;
  installCopy: string;
  installAction: string;
  iosInstruction: string;
  dismiss: string;
  updateTitle: string;
  updateCopy: string;
  updateAction: string;
  offlineReady: string;
}

export const pwaLocales: Record<LanguageCode, PwaLocale> = {
  ru: {
    installTitle: 'ДОБАВИТЬ В АРХИВ', installCopy: 'Установите THE OUTSIDE для быстрого доступа и чтения без сети.', installAction: 'УСТАНОВИТЬ',
    iosInstruction: 'В Safari нажмите «Поделиться», затем «На экран Домой».', dismiss: 'Не показывать снова',
    updateTitle: 'АРХИВ ОБНОВЛЁН', updateCopy: 'Новая версия готова. Текущая сцена останется нетронутой до вашего подтверждения.', updateAction: 'ОБНОВИТЬ', offlineReady: 'Архив готов к работе без сети.'
  },
  be: {
    installTitle: 'ДАДАЦЬ У АРХІЎ', installCopy: 'Усталюйце THE OUTSIDE для хуткага доступу і чытання без сеткі.', installAction: 'УСТАЛЯВАЦЬ',
    iosInstruction: 'У Safari націсніце «Падзяліцца», потым «На пачатковы экран».', dismiss: 'Больш не паказваць',
    updateTitle: 'АРХІЎ АБНОЎЛЕНЫ', updateCopy: 'Новая версія гатовая. Бягучая сцэна застанецца некранутай да вашага пацверджання.', updateAction: 'АБНАВІЦЬ', offlineReady: 'Архіў гатовы да працы без сеткі.'
  },
  en: {
    installTitle: 'ADD TO THE ARCHIVE', installCopy: 'Install THE OUTSIDE for quick access and offline reading.', installAction: 'INSTALL',
    iosInstruction: 'In Safari, tap Share, then Add to Home Screen.', dismiss: 'Do not show again',
    updateTitle: 'ARCHIVE UPDATED', updateCopy: 'A new version is ready. Your current scene will remain untouched until you confirm.', updateAction: 'UPDATE', offlineReady: 'The archive is ready offline.'
  },
  es: {
    installTitle: 'AÑADIR AL ARCHIVO', installCopy: 'Instala THE OUTSIDE para acceder rápido y leer sin conexión.', installAction: 'INSTALAR',
    iosInstruction: 'En Safari, pulsa Compartir y luego Añadir a pantalla de inicio.', dismiss: 'No volver a mostrar',
    updateTitle: 'ARCHIVO ACTUALIZADO', updateCopy: 'Hay una nueva versión lista. La escena actual no cambiará hasta que lo confirmes.', updateAction: 'ACTUALIZAR', offlineReady: 'El archivo está listo para usarse sin conexión.'
  }
};
