-- Migration: add publishers master + issue volume uniqueness
-- Safe for existing databases (non-fresh install).

begin;

-- 1) Master table for publishers
create table if not exists public.publishers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

-- Seed common publishers (idempotent)
insert into public.publishers (name)
values ('Marvel Comics'), ('DC Comics'), ('Image Comics')
on conflict (name) do nothing;

-- 2) Backfill publishers from existing titles.publisher text column
insert into public.publishers (name)
select distinct t.publisher
from public.titles t
where t.publisher is not null and btrim(t.publisher) <> ''
on conflict (name) do nothing;

-- 3) Add volume support to issues (if not already present)
alter table public.issues
  add column if not exists volume text;

-- 4) Replace old uniqueness (title_id, issue_number)
--    with new uniqueness (title_id, volume, issue_number) including null-volume handling.
alter table public.issues
  drop constraint if exists issues_title_id_issue_number_key;

alter table public.issues
  drop constraint if exists issues_title_id_volume_issue_number_key;

alter table public.issues
  add constraint issues_title_id_volume_issue_number_key
  unique nulls not distinct (title_id, volume, issue_number);

-- 5) Enable RLS for publishers table
alter table public.publishers enable row level security;

commit;
