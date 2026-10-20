import type { CitizenshipLocale } from '@/types/citizenship';
import type { LanguageCode } from '@/types/content';

export const citizenshipLocales: Record<LanguageCode, CitizenshipLocale> = {
  ru: {
    inviteLabel: 'ДОПОЛНИТЕЛЬНЫЙ ПРОТОКОЛ', inviteTitle: 'Получить гражданство',
    inviteCopy: 'История открыта каждому. Авторизация через Spotify — необязательный способ получить статус гражданина, не ограничивающий гостевой доступ.',
    obtain: 'ПОЛУЧИТЬ ГРАЖДАНСТВО', working: 'ПЕРЕНАПРАВЛЕНИЕ…', panelTitle: 'SPOTIFY AUTH RECORD',
    displayName: 'Имя Spotify', userId: 'Supabase user ID', authState: 'Авторизация', authenticated: 'ПОДТВЕРЖДЕНА', signOut: 'ВЫЙТИ',
    unavailable: 'Spotify-вход не настроен в этом окружении. История полностью доступна без авторизации.',
    oauthError: 'Spotify-вход не завершён. Попробуйте ещё раз.', sessionError: 'Не удалось восстановить сессию. Попробуйте войти снова.', signoutError: 'Не удалось завершить сессию.',
    avatarAlt: 'Аватар Spotify пользователя {name}'
  },
  be: {
    inviteLabel: 'ДАДАТКОВЫ ПРАТАКОЛ', inviteTitle: 'Атрымаць грамадзянства',
    inviteCopy: 'Гісторыя адкрытая кожнаму. Аўтарызацыя праз Spotify — неабавязковы спосаб атрымаць статус грамадзяніна, які не абмяжоўвае гасцявы доступ.',
    obtain: 'АТРЫМАЦЬ ГРАМАДЗЯНСТВА', working: 'ПЕРАКІРАВАННЕ…', panelTitle: 'SPOTIFY AUTH RECORD',
    displayName: 'Імя Spotify', userId: 'Supabase user ID', authState: 'Аўтарызацыя', authenticated: 'ПАЦВЕРДЖАНАЯ', signOut: 'ВЫЙСЦІ',
    unavailable: 'Уваход праз Spotify не наладжаны ў гэтым асяроддзі. Гісторыя цалкам даступная без аўтарызацыі.',
    oauthError: 'Уваход праз Spotify не завершаны. Паспрабуйце яшчэ раз.', sessionError: 'Не ўдалося аднавіць сеанс. Паспрабуйце ўвайсці зноў.', signoutError: 'Не ўдалося завяршыць сеанс.',
    avatarAlt: 'Аватар карыстальніка Spotify {name}'
  },
  en: {
    inviteLabel: 'OPTIONAL PROTOCOL', inviteTitle: 'Obtain citizenship',
    inviteCopy: 'The story remains open to everyone. Spotify authentication is an optional route to citizen status and never restricts guest access.',
    obtain: 'OBTAIN CITIZENSHIP', working: 'REDIRECTING…', panelTitle: 'SPOTIFY AUTH RECORD',
    displayName: 'Spotify name', userId: 'Supabase user ID', authState: 'Authentication', authenticated: 'CONFIRMED', signOut: 'SIGN OUT',
    unavailable: 'Spotify sign-in is not configured in this environment. The complete story remains available without authentication.',
    oauthError: 'Spotify sign-in did not complete. Please try again.', sessionError: 'The session could not be restored. Please sign in again.', signoutError: 'The session could not be closed.',
    avatarAlt: 'Spotify avatar for {name}'
  },
  es: {
    inviteLabel: 'PROTOCOLO OPCIONAL', inviteTitle: 'Obtener ciudadanía',
    inviteCopy: 'La historia sigue abierta para todos. La autenticación con Spotify es una vía opcional a la ciudadanía y nunca limita el acceso como visitante.',
    obtain: 'OBTENER CIUDADANÍA', working: 'REDIRIGIENDO…', panelTitle: 'SPOTIFY AUTH RECORD',
    displayName: 'Nombre de Spotify', userId: 'Supabase user ID', authState: 'Autenticación', authenticated: 'CONFIRMADA', signOut: 'CERRAR SESIÓN',
    unavailable: 'El acceso con Spotify no está configurado en este entorno. La historia completa sigue disponible sin autenticación.',
    oauthError: 'No se completó el acceso con Spotify. Inténtalo de nuevo.', sessionError: 'No se pudo restaurar la sesión. Vuelve a iniciar sesión.', signoutError: 'No se pudo cerrar la sesión.',
    avatarAlt: 'Avatar de Spotify de {name}'
  }
};
