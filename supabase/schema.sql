-- Applyloop v1 schema. Single founder-user, no auth.
-- Run this once in the Supabase SQL editor for the applyloop project
-- (https://supabase.com/dashboard/project/npnesqdebnlhgkhmvspf/sql/new).

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
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

alter table profiles enable row level security;
alter table openings enable row level security;
alter table applications enable row level security;

-- There's no login in v1 — every query runs server-side (Server
-- Components/Actions) through utils/supabase/server.ts, which is never
-- imported into client code. These policies are permissive because the
-- key that uses them never reaches the browser. If auth is ever added,
-- replace these with policies scoped to auth.uid() before shipping a
-- browser Supabase client against this schema.
create policy "server full access" on profiles for all using (true) with check (true);
create policy "server full access" on openings for all using (true) with check (true);
create policy "server full access" on applications for all using (true) with check (true);
