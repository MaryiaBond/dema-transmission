# THE OUTSIDE

Интерактивная история Twenty One Pilots на Vue 3, TypeScript и Vite. Поддерживаются русский, беларуская, English и Español, адаптивная навигация, необязательный Spotify-вход через Supabase Auth и игровой режим `02 / THE ARCHIVE`.

Вся история, Story Cycle, видео и музыкальные ссылки доступны без авторизации.

## DEMA Archive

PHASE A содержит три расследования, доску улик, журнал документов, восстановление хронологии, девять музыкальных записей с ручной отметкой, пять достижений и философскую аттестацию. Гостевой прогресс хранится локально и не зависит от Story Cycle или Spotify API.

Архив загружается отдельно от Story Reader. Архитектура и включение опциональной Supabase-синхронизации описаны в [docs/dema-archive.md](docs/dema-archive.md).

## Запуск

```bash
npm install
cp .env.example .env.local
npm run dev
```

Для Spotify OAuth нужны только публичные browser-переменные:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
VITE_ARCHIVE_SYNC_ENABLED=false
```

Spotify Client Secret хранится только в Supabase Dashboard и не добавляется в проект.

## Проверки

```bash
npm run typecheck
npm test
npm run build
npm run test:e2e
```

## Spotify OAuth smoke test

Кнопка `OBTAIN CITIZENSHIP` вызывает `supabase.auth.signInWithOAuth()` со Spotify, scope `user-read-recently-played` и возвратом на текущий origin. Supabase client сохраняет и восстанавливает собственную сессию. После входа интерфейс показывает только доступные Spotify metadata, Supabase user ID, состояние авторизации и Sign out.

Email не является обязательным. Проект не создаёт профиль в Postgres, паспорт, историю прослушиваний или интеграцию Last.fm.

Dashboard checklist и ручной сценарий: [docs/spotify-oauth-smoke-test.md](docs/spotify-oauth-smoke-test.md).

THE OUTSIDE — неофициальный фанатский проект и не связан с Twenty One Pilots, Fueled by Ramen, Spotify, Supabase или Яндекс Музыкой.
