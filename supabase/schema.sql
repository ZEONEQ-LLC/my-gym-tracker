-- ============================================================================
-- Gym Tracker — Supabase schema
-- ============================================================================
-- Translates lib/domain/types.ts (Exercise, HistoryEntry, Profile) into Postgres.
--
-- Mapping notes (column ↔ domain field):
--   • snake_case columns map to camelCase domain fields in the repository layer
--     (e.g. target_sets ↔ targetSets, exercise_id ↔ exerciseId).
--   • exercises.category  ↔ Exercise.group        ("group" is a reserved word)
--   • exercises.settings  ↔ Exercise.settings      Record<variant, Record<param,value>>  → jsonb
--   • exercises.variants  ↔ Exercise.variants      string[] | null                        → text[]
--   • history_entries.sets ↔ HistoryEntry.sets     SetEntry[] ({reps,weight})             → jsonb
--   • history_entries.date ↔ HistoryEntry.date     'YYYY-MM-DD' (local)                   → date
--
-- Identity model: the domain uses string slugs as exercise ids, unique per user.
-- We therefore key exercises on (user_id, id) and reference that composite from
-- history_entries, so deleting an exercise cascades its history. Every table
-- carries user_id uuid references auth.users for RLS.
--
-- Run this once in the Supabase SQL editor.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- profiles : one row per user (Profile)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  name       text not null default '',
  goal       text not null default '',
  warmup     text not null default '',
  accent     text not null default 'Emerald'
             check (accent in ('Emerald', 'Slate-Blau', 'Terrakotta', 'Pflaume')),
  updated_at timestamptz not null default now()
);

-- Auto-create a profile row for every new auth user.
-- SECURITY DEFINER: the trigger fires during signup, before any auth.uid()
-- request context exists, so it runs with the function owner's rights and
-- inserts past RLS. `set search_path = ''` forces every reference to be fully
-- schema-qualified (public.profiles, auth.users), closing the search_path
-- hijacking hole that SECURITY DEFINER functions are otherwise prone to.
-- Only user_id is inserted; the table defaults fill name/goal/warmup/accent.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- exercises : one row per exercise (Exercise). PK = (user_id, id-slug)
-- ---------------------------------------------------------------------------
create table if not exists public.exercises (
  user_id     uuid not null references auth.users (id) on delete cascade,
  id          text not null,                       -- slug, unique per user
  name        text not null,
  category    text not null default 'Weitere',     -- domain: group
  photo       text,                                -- data URL / hosted URL; null = none
  variants    text[],                              -- null = single variant ('default')
  target_sets integer not null default 3 check (target_sets >= 1),
  target_reps integer not null default 10 check (target_reps >= 1),
  settings    jsonb not null default '{}'::jsonb,  -- { [variant]: { [param]: value } }
  note        text not null default '',
  created_at  timestamptz not null default now(),
  primary key (user_id, id)
);

-- ---------------------------------------------------------------------------
-- history_entries : one row per logged session (HistoryEntry)
-- ---------------------------------------------------------------------------
create table if not exists public.history_entries (
  user_id     uuid not null references auth.users (id) on delete cascade,
  id          text not null,                       -- domain id ('e' + timestamp)
  exercise_id text not null,
  date        date not null,
  variant     text not null default 'default',
  sets        jsonb not null default '[]'::jsonb,  -- [{ reps, weight }, ...]
  note        text not null default '',
  created_at  timestamptz not null default now(),
  primary key (user_id, id),
  foreign key (user_id, exercise_id)
    references public.exercises (user_id, id) on delete cascade
);

-- Speeds up the per-exercise history lookups done on load.
create index if not exists history_entries_user_exercise_idx
  on public.history_entries (user_id, exercise_id);

-- ============================================================================
-- Row-Level Security: each user sees and mutates only their own rows.
-- ============================================================================

alter table public.profiles        enable row level security;
alter table public.exercises       enable row level security;
alter table public.history_entries enable row level security;

-- ---- profiles ----
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own" on public.profiles
  for delete to authenticated using (auth.uid() = user_id);

-- ---- exercises ----
drop policy if exists "exercises_select_own" on public.exercises;
create policy "exercises_select_own" on public.exercises
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "exercises_insert_own" on public.exercises;
create policy "exercises_insert_own" on public.exercises
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "exercises_update_own" on public.exercises;
create policy "exercises_update_own" on public.exercises
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "exercises_delete_own" on public.exercises;
create policy "exercises_delete_own" on public.exercises
  for delete to authenticated using (auth.uid() = user_id);

-- ---- history_entries ----
drop policy if exists "history_select_own" on public.history_entries;
create policy "history_select_own" on public.history_entries
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "history_insert_own" on public.history_entries;
create policy "history_insert_own" on public.history_entries
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "history_update_own" on public.history_entries;
create policy "history_update_own" on public.history_entries
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "history_delete_own" on public.history_entries;
create policy "history_delete_own" on public.history_entries
  for delete to authenticated using (auth.uid() = user_id);
