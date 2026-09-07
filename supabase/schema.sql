-- Applyloop schema — multi-tenant (Google/LinkedIn/GitHub via Supabase Auth).
-- Safe to re-run: uses `if not exists` / `drop policy if exists` throughout,
-- so it also upgrades the earlier single-tenant version of this schema.
-- Run in the Supabase SQL editor for the applyloop project:
-- https://supabase.com/dashboard/project/npnesqdebnlhgkhmvspf/sql/new

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  resume_text text,
  roles text[] not null default '{}',
  location text,
  timezone text,
  work_locations text[] not null default '{}',
  min_base text,
  work_auth text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Role-specific CVs. Keep one source resume on profiles for backwards compatibility.
create table if not exists resume_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_roles text[] not null default '{}',
  resume_text text not null,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table resume_profiles enable row level security;
drop policy if exists "own resume profiles" on resume_profiles;
create policy "own resume profiles" on resume_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists resume_profiles_user_id_idx on resume_profiles(user_id);

create table if not exists openings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  company text not null,
  location text,
  comp text,
  description text not null,
  url text,
  posted_label text,
  fit_score int,
  fit_rationale text,
  selected boolean not null default false,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  opening_id uuid not null references openings(id) on delete cascade,
  draft_text text,
  draft_highlight text,  -- the one honest/unflattering detail Claude called out
  draft_missing text,    -- fact(s) Claude declined to invent
  signoff text,
  status text not null default 'drafting', -- drafting | sent
  status_note text,                        -- e.g. "Interview Thu", "Recruiter replied"
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- Upgrade path from the old single-tenant schema, if it was already applied.
alter table openings add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table applications add column if not exists user_id uuid references auth.users(id) on delete cascade;

create index if not exists openings_user_id_idx on openings(user_id);
create index if not exists applications_user_id_idx on applications(user_id);

alter table profiles enable row level security;
alter table openings enable row level security;
alter table applications enable row level security;

drop policy if exists "server full access" on profiles;
drop policy if exists "server full access" on openings;
drop policy if exists "server full access" on applications;

drop policy if exists "own profile" on profiles;
create policy "own profile" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "own openings" on openings;
create policy "own openings" on openings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own applications" on applications;
create policy "own applications" on applications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Job aggregation + status pipeline.

alter table profiles add column if not exists home_lat double precision;
alter table profiles add column if not exists home_lng double precision;
alter table profiles add column if not exists max_distance_km int;
alter table profiles add column if not exists quiz_answers jsonb not null default '{}'::jsonb;

alter table openings add column if not exists source text not null default 'manual';
alter table openings add column if not exists external_id text;
alter table openings add column if not exists lat double precision;
alter table openings add column if not exists lng double precision;
alter table openings add column if not exists remote boolean not null default false;
alter table openings add column if not exists fetched_at timestamptz not null default now();
alter table openings add column if not exists logo_url text;
alter table openings add column if not exists employer_website text;
alter table openings add column if not exists publisher text;
alter table openings add column if not exists employment_type text;
alter table openings add column if not exists is_direct_apply boolean not null default false;

-- Dedup key for auto-pulled openings. Manual rows keep external_id null and
-- are exempt — a unique index ignores rows where the indexed value is null.
create unique index if not exists openings_source_dedup_idx
  on openings(user_id, source, external_id) where external_id is not null;

-- Structured status pipeline: drafting -> sent -> interviewing/offer/rejected.
-- status_note stays a free-text note on a card, decoupled from the stage.
alter table applications drop constraint if exists applications_status_check;
alter table applications add constraint applications_status_check
  check (status in ('drafting', 'sent', 'interviewing', 'offer', 'rejected'));
