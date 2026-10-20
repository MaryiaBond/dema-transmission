# DEMA Archive — Phase A

`02 / THE ARCHIVE` is a self-contained game module. It does not read or modify Story Cycle, Language Drift, Spotify tokens, listening history, or the story reader state.

## Playable content

- `CASE 001 / THE MISSING MEMBERS`: inspect three records, connect the lineup evidence, and restore the event sequence.
- `CASE 002 / INVISIBLE COLOR`: connect the visual markers with the confirmed yellow blind spot.
- `CASE 003 / THE PERFECT BROADCAST`: connect the broadcast, anagram, and Clancy testimony.
- Nine music records with unchanged external YouTube, Spotify, and Yandex Music links.
- Five achievements and a nine-stage compliance assessment.

Every document is marked in structured data as a verified historical fact, confirmed story canon, or fictional game document. This is an independent unofficial fan story.

## Progress model

Guest progress is stored under `the-outside-archive-progress-v1`. Opening an external music link sets only `visitedExternalLink`. The separate `markedAsStudied` value is changed exclusively by the player's manual action and records `studiedAt`.

The rules, completion checks, achievement registration, persistence merge, and assessment unlock are implemented outside Vue components.

## Optional Supabase sync

Local mode is complete and remains the default. To enable authenticated progress sync:

1. Apply `supabase/migrations/202610190002_archive_progress.sql` to the same Supabase project used for authentication.
2. Add `VITE_ARCHIVE_SYNC_ENABLED=true` to the deployment environment.
3. Rebuild the application.

The migration creates `archive_progress`, enables RLS, and restricts select/insert/update operations to `auth.uid() = user_id`. Writes use an idempotent upsert. When a citizen has local progress, the UI requests confirmation before merging it into the remote copy. The local copy is retained after a successful transfer and remains usable after a server failure.

Do not enable the flag before the migration is present. No service-role key belongs in the browser environment.

## Source and platform boundaries

Case references link to the official Twenty One Pilots videos already used by THE OUTSIDE and to the cited historical interview. The game uses no Spotify Web API, playback SDK, polling, or derived listening metrics. Spotify links are ordinary external links and never unlock content by being clicked.

- [I Am Clancy — official recap](https://www.youtube.com/watch?v=ozlHHR_eSxc)
- [Nico and the Niners — official video](https://www.youtube.com/watch?v=hMAPyGoqQVw)
- [Spotify Developer Policy](https://developer.spotify.com/policy)
