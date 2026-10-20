import type { LanguageCode } from '@/types/content';

interface PwaLocale {
  footerTitle: string;
  installCopy: string;
  installAction: string;
  guideTitle: string;
  close: string;
  iosSteps: [string, string, string, string];
  safariInstruction: string;
  firefoxInstruction: string;
  genericInstruction: string;
  updateTitle: string;
  updateCopy: string;
  updateAction: string;
  offlineReady: string;
}

export const pwaLocales: Record<LanguageCode, PwaLocale> = {
  ru: {
    footerTitle: 'АРХИВ МОЖНО ЗАБРАТЬ С СОБОЙ', installCopy: 'Установите THE OUTSIDE на своё устройство и возвращайтесь к расследованиям.', installAction: 'УСТАНОВИТЬ ИГРУ', guideTitle: 'УСТАНОВКА THE OUTSIDE', close: 'Закрыть инструкцию',
    iosSteps: ['Откройте меню «Поделиться».', 'Выберите «На экран Домой».', 'При наличии опции включите «Открывать как веб-приложение».', 'Нажмите «Добавить».'], safariInstruction: 'В меню «Файл» выберите «Добавить в Dock». Если команды нет, откройте сайт в актуальной версии Safari.', firefoxInstruction: 'Откройте меню браузера и выберите «Установить» или «Добавить на главный экран». Если команды нет, откройте сайт в Chrome или Edge.', genericInstruction: 'Откройте меню браузера и выберите «Установить приложение» или «Добавить на главный экран». Если такой команды нет, используйте Chrome или Edge.',
    updateTitle: 'АРХИВ ОБНОВЛЁН', updateCopy: 'Новая версия готова. Текущая сцена останется нетронутой до вашего подтверждения.', updateAction: 'ОБНОВИТЬ', offlineReady: 'Архив готов к работе без сети.'
  },
  be: {
    footerTitle: 'АРХІЎ МОЖНА ЗАБРАЦЬ З САБОЙ', installCopy: 'Усталюйце THE OUTSIDE на сваю прыладу і вяртайцеся да расследаванняў.', installAction: 'УСТАЛЯВАЦЬ ГУЛЬНЮ', guideTitle: 'УСТАЛЯВАННЕ THE OUTSIDE', close: 'Закрыць інструкцыю',
    iosSteps: ['Адкрыйце меню «Падзяліцца».', 'Выберыце «На пачатковы экран».', 'Калі опцыя даступная, уключыце «Адкрываць як вэб-праграму».', 'Націсніце «Дадаць».'], safariInstruction: 'У меню «Файл» выберыце «Дадаць у Dock». Калі каманды няма, адкрыйце сайт у актуальнай версіі Safari.', firefoxInstruction: 'Адкрыйце меню браўзера і выберыце «Усталяваць» або «Дадаць на пачатковы экран». Калі каманды няма, адкрыйце сайт у Chrome або Edge.', genericInstruction: 'Адкрыйце меню браўзера і выберыце «Усталяваць праграму» або «Дадаць на пачатковы экран». Калі такой каманды няма, выкарыстоўвайце Chrome або Edge.',
    updateTitle: 'АРХІЎ АБНОЎЛЕНЫ', updateCopy: 'Новая версія гатовая. Бягучая сцэна застанецца некранутай да вашага пацверджання.', updateAction: 'АБНАВІЦЬ', offlineReady: 'Архіў гатовы да працы без сеткі.'
  },
  en: {
    footerTitle: 'TAKE THE ARCHIVE WITH YOU', installCopy: 'Install THE OUTSIDE on your device and return to the investigations.', installAction: 'INSTALL GAME', guideTitle: 'INSTALL THE OUTSIDE', close: 'Close instructions',
    iosSteps: ['Open the Share menu.', 'Choose Add to Home Screen.', 'Enable Open as Web App when the option is available.', 'Tap Add.'], safariInstruction: 'Choose Add to Dock from the File menu. If it is unavailable, open the site in the latest Safari.', firefoxInstruction: 'Open the browser menu and choose Install or Add to Home Screen. If the command is unavailable, open the site in Chrome or Edge.', genericInstruction: 'Open the browser menu and choose Install app or Add to Home Screen. If no such command is available, use Chrome or Edge.',
    updateTitle: 'ARCHIVE UPDATED', updateCopy: 'A new version is ready. Your current scene will remain untouched until you confirm.', updateAction: 'UPDATE', offlineReady: 'The archive is ready offline.'
  },
  es: {
    footerTitle: 'LLÉVATE EL ARCHIVO CONTIGO', installCopy: 'Instala THE OUTSIDE en tu dispositivo y vuelve a las investigaciones.', installAction: 'INSTALAR JUEGO', guideTitle: 'INSTALAR THE OUTSIDE', close: 'Cerrar instrucciones',
    iosSteps: ['Abre el menú Compartir.', 'Elige Añadir a pantalla de inicio.', 'Si aparece la opción, activa Abrir como app web.', 'Pulsa Añadir.'], safariInstruction: 'En el menú Archivo, elige Añadir al Dock. Si no aparece, abre el sitio en la versión más reciente de Safari.', firefoxInstruction: 'Abre el menú del navegador y elige Instalar o Añadir a pantalla de inicio. Si no aparece, abre el sitio en Chrome o Edge.', genericInstruction: 'Abre el menú del navegador y elige Instalar aplicación o Añadir a pantalla de inicio. Si no aparece, usa Chrome o Edge.',
    updateTitle: 'ARCHIVO ACTUALIZADO', updateCopy: 'Hay una nueva versión lista. La escena actual no cambiará hasta que lo confirmes.', updateAction: 'ACTUALIZAR', offlineReady: 'El archivo está listo para usarse sin conexión.'
  }
};
