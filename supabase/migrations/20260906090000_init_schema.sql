-- FIO — core schema (spec §17). Engine: projects → modules → entries → links.

create extension if not exists "pgcrypto";
create extension if not exists "unaccent";

-- ─────────────────────────────────────────────────────────────────────────────
-- enums
-- ─────────────────────────────────────────────────────────────────────────────
create type readiness    as enum ('seed', 'vague', 'defined');
create type lifecycle     as enum ('active', 'shelved', 'finished');
create type module_status as enum ('active', 'archived');
create type q_priority    as enum ('blocking', 'important', 'minor');
create type q_status      as enum ('open', 'exploring', 'resolved');
create type q_source      as enum ('brainstorm', 'gap', 'chaos', 'rant', 'manual');
create type rant_mode     as enum ('text', 'audio');
create type transcript_state as enum ('none', 'queued', 'processing', 'done', 'failed');
create type link_relation as enum ('derived_from', 'references', 'related', 'blocks');
create type session_status as enum ('open', 'reviewed');
create type response_disposition as enum ('pending', 'sent', 'kept', 'discarded');
create type artifact_kind as enum ('file', 'link');
create type presentation  as enum
  ('sheet', 'slots', 'list', 'board', 'table', 'timeline', 'gallery', 'grid', 'canvas');

-- ─────────────────────────────────────────────────────────────────────────────
-- users
-- ─────────────────────────────────────────────────────────────────────────────
create table public.users (
  id           uuid primary key references auth.users (id) on delete cascade,
  email        text,
  display_name text,
  settings     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.users (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- module_definitions — the library (app-authored + user-authored)
-- ─────────────────────────────────────────────────────────────────────────────
create table public.module_definitions (
  id                 uuid primary key default gen_random_uuid(),
  key                text not null,
  name               text not null,
  icon               text,
  presentation       presentation not null default 'list',
  intro              text,
  entry_schema       jsonb not null default '[]'::jsonb,
  gap_rules          jsonb not null default '[]'::jsonb,
  category_affinity  text[] not null default '{}',
  suggested_with     text[] not null default '{}',
  is_universal       boolean not null default false,
  author_id          uuid references public.users (id) on delete set null,
  is_public          boolean not null default true,
  version            int not null default 1,
  created_at         timestamptz not null default now()
);
-- App-authored modules: one row per key. User-authored: one per (author, key).
create unique index module_definitions_app_key_idx
  on public.module_definitions (key) where author_id is null;
create unique index module_definitions_user_key_idx
  on public.module_definitions (author_id, key) where author_id is not null;

-- ─────────────────────────────────────────────────────────────────────────────
-- projects
-- ─────────────────────────────────────────────────────────────────────────────
create table public.projects (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.users (id) on delete cascade,
  title              text not null,
  one_liner          text,
  original_one_liner text,
  category           text not null,
  subtype            text not null,
  spec_tags          text[] not null default '{}',
  readiness          readiness not null default 'vague',
  status             text not null default 'seed',
  lifecycle          lifecycle not null default 'active',
  accent             text,
  target_type        text,
  target_value       numeric,
  deadline           date,
  finished_at        timestamptz,
  shelved_at         timestamptz,
  reflection         jsonb,
  completion_count   int not null default 0,
  is_example         boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  last_touched_at    timestamptz not null default now()
);
create index projects_user_idx on public.projects (user_id, lifecycle, last_touched_at desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- project_modules — the entire modularity mechanism
-- ─────────────────────────────────────────────────────────────────────────────
create table public.project_modules (
  id                   uuid primary key default gen_random_uuid(),
  project_id           uuid not null references public.projects (id) on delete cascade,
  module_definition_id uuid not null references public.module_definitions (id),
  custom_name          text,
  order_index          int not null default 0,
  status               module_status not null default 'active',
  config               jsonb not null default '{}'::jsonb,
  created_at           timestamptz not null default now(),
  unique (project_id, module_definition_id)
);
create index project_modules_project_idx on public.project_modules (project_id, status, order_index);

-- ─────────────────────────────────────────────────────────────────────────────
-- entries — every card, character, source, task, beat, booking
-- ─────────────────────────────────────────────────────────────────────────────
create table public.entries (
  id                uuid primary key default gen_random_uuid(),
  project_id        uuid not null references public.projects (id) on delete cascade,
  project_module_id uuid not null references public.project_modules (id) on delete cascade,
  title             text,
  values            jsonb not null default '{}'::jsonb,
  status            text,
  order_index       int not null default 0,
  search_tsv        tsvector,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index entries_module_idx on public.entries (project_module_id, order_index);
create index entries_project_idx on public.entries (project_id, created_at desc);
create index entries_search_idx on public.entries using gin (search_tsv);

-- ─────────────────────────────────────────────────────────────────────────────
-- rants
-- ─────────────────────────────────────────────────────────────────────────────
create table public.rants (
  id                uuid primary key default gen_random_uuid(),
  project_id        uuid not null references public.projects (id) on delete cascade,
  mode              rant_mode not null default 'text',
  body_text         text,
  audio_url         text,
  transcript        text,
  transcript_status transcript_state not null default 'none',
  duration_ms       int,
  mood              text,
  tags              text[] not null default '{}',
  mined             boolean not null default false,
  search_tsv        tsvector,
  created_at        timestamptz not null default now()
);
create index rants_project_idx on public.rants (project_id, created_at desc);
create index rants_search_idx on public.rants using gin (search_tsv);

-- ─────────────────────────────────────────────────────────────────────────────
-- questions — the spine
-- ─────────────────────────────────────────────────────────────────────────────
create table public.questions (
  id                  uuid primary key default gen_random_uuid(),
  project_id          uuid not null references public.projects (id) on delete cascade,
  text                text not null,
  priority            q_priority not null default 'important',
  status              q_status not null default 'open',
  answer              text,
  resolved_to_entry_id uuid references public.entries (id) on delete set null,
  source              q_source not null default 'manual',
  search_tsv          tsvector,
  created_at          timestamptz not null default now(),
  resolved_at         timestamptz
);
create index questions_project_idx on public.questions (project_id, status, priority, created_at);
create index questions_search_idx on public.questions using gin (search_tsv);

-- ─────────────────────────────────────────────────────────────────────────────
-- links — typed edges between entries, rants, questions
-- ─────────────────────────────────────────────────────────────────────────────
create table public.links (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  from_type  text not null,
  from_id    uuid not null,
  to_type    text not null,
  to_id      uuid not null,
  relation   link_relation not null default 'related',
  meta       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index links_project_idx on public.links (project_id);
create index links_from_idx on public.links (from_type, from_id);
create index links_to_idx on public.links (to_type, to_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- brainstorm
-- ─────────────────────────────────────────────────────────────────────────────
create table public.brainstorm_sessions (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects (id) on delete cascade,
  topics       text[] not null default '{}',
  seed_type    text,
  seed_id      uuid,
  status       session_status not null default 'open',
  created_at   timestamptz not null default now(),
  completed_at timestamptz
);
create index brainstorm_sessions_project_idx on public.brainstorm_sessions (project_id, created_at desc);

create table public.brainstorm_responses (
  id             uuid primary key default gen_random_uuid(),
  session_id     uuid not null references public.brainstorm_sessions (id) on delete cascade,
  prompt_key     text,
  prompt_text    text not null,
  answers        jsonb not null default '[]'::jsonb,
  starred_index  int,
  disposition    response_disposition not null default 'pending',
  sent_to_entry_id uuid references public.entries (id) on delete set null,
  order_index    int not null default 0,
  created_at     timestamptz not null default now()
);
create index brainstorm_responses_session_idx on public.brainstorm_responses (session_id, order_index);

-- ─────────────────────────────────────────────────────────────────────────────
-- prompt library + chaos templates (app-authored content, global read)
-- ─────────────────────────────────────────────────────────────────────────────
create table public.prompt_library (
  id            uuid primary key default gen_random_uuid(),
  key           text not null unique,
  topic         text not null,
  categories    text[] not null default '{}',
  subtypes      text[] not null default '{}',
  question      text not null,
  hint          text,
  alternates    jsonb not null default '[]'::jsonb,
  followup_rules jsonb not null default '[]'::jsonb,
  order_index   int not null default 0
);

create table public.chaos_templates (
  id          uuid primary key default gen_random_uuid(),
  template    text not null,
  categories  text[] not null default '{}',
  slot_spec   jsonb not null default '[]'::jsonb,
  weight      numeric not null default 1
);

-- ─────────────────────────────────────────────────────────────────────────────
-- canvas (phase 2 scaffolding), gap dismissals, activity
-- ─────────────────────────────────────────────────────────────────────────────
create table public.canvases (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  name       text not null default 'Canvas',
  document   jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.canvas_refs (
  id        uuid primary key default gen_random_uuid(),
  canvas_id uuid not null references public.canvases (id) on delete cascade,
  shape_id  text not null,
  entry_id  uuid not null references public.entries (id) on delete cascade
);

create table public.gap_dismissals (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects (id) on delete cascade,
  gap_key      text not null,
  dismissed_at timestamptz not null default now(),
  unique (project_id, gap_key)
);

create table public.activity (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects (id) on delete cascade,
  kind         text not null,
  subject_type text,
  subject_id   uuid,
  meta         jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);
create index activity_project_idx on public.activity (project_id, created_at desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- artifacts — the finished thing(s)
-- ─────────────────────────────────────────────────────────────────────────────
create table public.artifacts (
  id               uuid primary key default gen_random_uuid(),
  project_id       uuid not null references public.projects (id) on delete cascade,
  kind             artifact_kind not null default 'file',
  file_url         text,
  link_url         text,
  mime_type        text,
  title            text,
  caption          text,
  is_cover         boolean not null default false,
  order_index      int not null default 0,
  completion_index int not null default 0,
  created_at       timestamptz not null default now()
);
create index artifacts_project_idx on public.artifacts (project_id, order_index);
