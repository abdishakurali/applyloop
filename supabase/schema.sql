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
