create table if not exists public.archive_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  progress jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.archive_progress enable row level security;

create policy "archive progress select own"
on public.archive_progress for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "archive progress insert own"
on public.archive_progress for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "archive progress update own"
on public.archive_progress for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
