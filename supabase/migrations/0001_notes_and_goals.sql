-- Phase 2: notes & goals, solo-scoped (docs/roadmap.md).
-- Applied manually via the Supabase SQL Editor for now — no CLI link yet.

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notes_user_id_idx on notes (user_id);

create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  done boolean not null default false,
  due_date date,
  created_at timestamptz not null default now()
);

create index if not exists goals_user_id_idx on goals (user_id);

-- Keep notes.updated_at accurate without relying on client code to set it.
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists notes_set_updated_at on notes;
create trigger notes_set_updated_at
  before update on notes
  for each row
  execute function set_updated_at();

-- Row Level Security: every row is owned by exactly one user_id, and
-- auth.uid() only ever equals the signed-in user's own id (or is null for
-- unauthenticated requests) — so this single policy per table denies both
-- anonymous access and every other user's rows, not just the "current"
-- known accounts.
alter table notes enable row level security;

create policy "Users manage their own notes"
  on notes
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter table goals enable row level security;

create policy "Users manage their own goals"
  on goals
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
