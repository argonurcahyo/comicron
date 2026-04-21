-- Comic Book Tracker schema (Supabase / PostgreSQL)
create extension if not exists pgcrypto;

create table if not exists public.titles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  publisher text default 'Marvel',
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  start_date date,
  end_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.issues (
  id uuid primary key default gen_random_uuid(),
  title_id uuid not null references public.titles(id) on delete cascade,
  issue_number text not null,
  summary text default '',
  reading_status text not null default 'planned' check (reading_status in ('planned', 'reading', 'completed', 'dropped')),
  cover_url text,
  release_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(title_id, issue_number)
);

create table if not exists public.characters (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  alias text,
  status text default 'active',
  affiliation text,
  lore_markdown text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.issue_characters (
  issue_id uuid not null references public.issues(id) on delete cascade,
  character_id uuid not null references public.characters(id) on delete cascade,
  role_note text,
  created_at timestamptz not null default now(),
  primary key (issue_id, character_id)
);

create table if not exists public.event_issues (
  event_id uuid not null references public.events(id) on delete cascade,
  issue_id uuid not null references public.issues(id) on delete cascade,
  reading_order integer not null,
  created_at timestamptz not null default now(),
  primary key (event_id, issue_id),
  unique(event_id, reading_order)
);

create index if not exists idx_issues_title_id on public.issues(title_id);
create index if not exists idx_issue_characters_character_id on public.issue_characters(character_id);
create index if not exists idx_event_issues_issue_id on public.event_issues(issue_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists issues_set_updated_at on public.issues;
create trigger issues_set_updated_at
before update on public.issues
for each row
execute procedure public.set_updated_at();

drop trigger if exists characters_set_updated_at on public.characters;
create trigger characters_set_updated_at
before update on public.characters
for each row
execute procedure public.set_updated_at();

-- Minimal RLS baseline for zero-cost personal usage:
-- Keep RLS on and only use service role key in server-side code.
alter table public.titles enable row level security;
alter table public.events enable row level security;
alter table public.issues enable row level security;
alter table public.characters enable row level security;
alter table public.issue_characters enable row level security;
alter table public.event_issues enable row level security;
