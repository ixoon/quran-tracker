-- Quran Tracker — Supabase schema
-- Run in SQL editor on a fresh project

create extension if not exists "pgcrypto";

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Progress (Madinah pages 1–604)
create table public.user_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  current_page int not null default 1 check (current_page between 1 and 604),
  last_surah int check (last_surah is null or last_surah between 1 and 114),
  last_ayah int check (last_ayah is null or last_ayah >= 1),
  pages_read_total int not null default 0,
  updated_at timestamptz not null default now()
);

-- Khatma / finish-in-X-days goal
create table public.reading_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  start_page int not null default 1,
  target_end_page int not null default 604,
  start_date date not null default (timezone('utc', now()))::date,
  end_date date not null,
  daily_pages_target int not null default 1,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

create unique index reading_goals_one_active_per_user
  on public.reading_goals (user_id)
  where is_active = true;

-- Streak
create table public.streak_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_marked_date date,
  updated_at timestamptz not null default now()
);

-- Favorites + notes
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  surah int not null check (surah between 1 and 114),
  ayah int not null check (ayah >= 1),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, surah, ayah)
);

create index favorites_user_updated_idx
  on public.favorites (user_id, updated_at desc);

-- Settings
create table public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  translation_ids jsonb not null default '[131, 20, 85]'::jsonb,
  reciter_id text not null default 'ar.alafasy',
  prayer_city text,
  prayer_lat double precision,
  prayer_lng double precision,
  prayer_method text not null default 'MuslimWorldLeague',
  prayer_notifications boolean not null default true,
  asr_method text not null default 'Standard' check (asr_method in ('Standard', 'Hanafi')),
  updated_at timestamptz not null default now()
);

-- Optional download wishlist metadata
create table public.audio_downloads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  reciter_id text not null,
  surah int not null check (surah between 1 and 114),
  updated_at timestamptz not null default now(),
  unique (user_id, reciter_id, surah)
);

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger user_progress_updated_at before update on public.user_progress
for each row execute function public.set_updated_at();
create trigger reading_goals_updated_at before update on public.reading_goals
for each row execute function public.set_updated_at();
create trigger streak_state_updated_at before update on public.streak_state
for each row execute function public.set_updated_at();
create trigger favorites_updated_at before update on public.favorites
for each row execute function public.set_updated_at();
create trigger user_settings_updated_at before update on public.user_settings
for each row execute function public.set_updated_at();
create trigger audio_downloads_updated_at before update on public.audio_downloads
for each row execute function public.set_updated_at();

-- Bootstrap rows for new users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  insert into public.user_progress (user_id) values (new.id);
  insert into public.streak_state (user_id) values (new.id);
  insert into public.user_settings (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.user_progress enable row level security;
alter table public.reading_goals enable row level security;
alter table public.streak_state enable row level security;
alter table public.favorites enable row level security;
alter table public.user_settings enable row level security;
alter table public.audio_downloads enable row level security;

create policy "profiles_own" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "progress_own" on public.user_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "goals_own" on public.reading_goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "streak_own" on public.streak_state
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "favorites_own" on public.favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "settings_own" on public.user_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "audio_own" on public.audio_downloads
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Self-service account deletion (requires authenticated user)
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;
