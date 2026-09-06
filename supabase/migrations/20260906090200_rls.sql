-- Row-level security. Everything is scoped to the owning user through the project.

alter table public.users               enable row level security;
alter table public.projects            enable row level security;
alter table public.project_modules     enable row level security;
alter table public.entries             enable row level security;
alter table public.rants               enable row level security;
alter table public.questions           enable row level security;
alter table public.links               enable row level security;
alter table public.brainstorm_sessions enable row level security;
alter table public.brainstorm_responses enable row level security;
alter table public.canvases            enable row level security;
alter table public.canvas_refs         enable row level security;
alter table public.gap_dismissals      enable row level security;
alter table public.activity            enable row level security;
alter table public.artifacts           enable row level security;
alter table public.module_definitions  enable row level security;
alter table public.prompt_library      enable row level security;
alter table public.chaos_templates     enable row level security;

-- helper: does auth.uid() own this project?
create or replace function public.owns_project(p uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.projects
    where id = p and user_id = (select auth.uid())
  );
$$;

-- users ----------------------------------------------------------------------
create policy "own row" on public.users
  for select using ((select auth.uid()) = id);
create policy "update own row" on public.users
  for update using ((select auth.uid()) = id);

-- projects -----------------------------------------------------------------
create policy "read own or example projects" on public.projects
  for select using (user_id = (select auth.uid()) or is_example);
create policy "insert own projects" on public.projects
  for insert with check (user_id = (select auth.uid()));
create policy "update own projects" on public.projects
  for update using (user_id = (select auth.uid()));
create policy "delete own projects" on public.projects
  for delete using (user_id = (select auth.uid()));

-- child tables: one policy each, keyed on owns_project() -------------------
do $$
declare t text;
begin
  foreach t in array array[
    'project_modules', 'entries', 'rants', 'questions', 'links',
    'brainstorm_sessions', 'canvases', 'gap_dismissals', 'activity', 'artifacts'
  ]
  loop
    execute format(
      'create policy "owner all" on public.%I for all
         using (public.owns_project(project_id))
         with check (public.owns_project(project_id))', t);
  end loop;
end;
$$;

-- brainstorm_responses / canvas_refs: reach the project through the parent
create policy "owner all" on public.brainstorm_responses
  for all using (exists (
    select 1 from public.brainstorm_sessions s
    where s.id = session_id and public.owns_project(s.project_id)
  ))
  with check (exists (
    select 1 from public.brainstorm_sessions s
    where s.id = session_id and public.owns_project(s.project_id)
  ));

create policy "owner all" on public.canvas_refs
  for all using (exists (
    select 1 from public.canvases c
    where c.id = canvas_id and public.owns_project(c.project_id)
  ))
  with check (exists (
    select 1 from public.canvases c
    where c.id = canvas_id and public.owns_project(c.project_id)
  ));

-- module_definitions: read app + public + own; write own ------------------
create policy "read library" on public.module_definitions
  for select using (author_id is null or is_public or author_id = (select auth.uid()));
create policy "insert own modules" on public.module_definitions
  for insert with check (author_id = (select auth.uid()));
create policy "update own modules" on public.module_definitions
  for update using (author_id = (select auth.uid()));
create policy "delete own modules" on public.module_definitions
  for delete using (author_id = (select auth.uid()));

-- prompt_library / chaos_templates: global read only ---------------------
create policy "read prompts" on public.prompt_library for select using (true);
create policy "read chaos" on public.chaos_templates for select using (true);
