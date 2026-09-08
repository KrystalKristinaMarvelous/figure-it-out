-- Project collaboration: share links, members, and an assignment checklist.
--
-- Model (per product spec): the owner shares either a *view* link or an *edit*
-- link. Anyone signed in who opens the link joins the project — view links make
-- viewers, edit links make editors. Editors can only create/edit entries inside
-- a module that has a checklist task assigned to them. Everything else stays
-- owner-only. Simultaneous work, assignment-scoped.

create type member_role  as enum ('editor', 'viewer');
create type share_access as enum ('view', 'edit');
create type task_state   as enum ('todo', 'doing', 'done');

-- ── who is on a project ─────────────────────────────────────────────────────
create table public.project_members (
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id    uuid not null references public.users (id) on delete cascade,
  role       member_role not null default 'editor',
  added_by   uuid references public.users (id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);
create index project_members_user_idx on public.project_members (user_id);

-- ── shareable links ────────────────────────────────────────────────────────
create table public.project_invites (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  token      text not null unique,
  access     share_access not null default 'view',
  created_by uuid not null references public.users (id) on delete cascade,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
create index project_invites_project_idx on public.project_invites (project_id);
-- at most one live link per access level per project
create unique index project_invites_live_idx
  on public.project_invites (project_id, access) where revoked_at is null;

-- ── the assignment checklist ───────────────────────────────────────────────
create table public.project_tasks (
  id                uuid primary key default gen_random_uuid(),
  project_id        uuid not null references public.projects (id) on delete cascade,
  project_module_id uuid references public.project_modules (id) on delete set null,
  title             text not null,
  detail            text,
  assignee_id       uuid references public.users (id) on delete set null,
  state             task_state not null default 'todo',
  created_by        uuid references public.users (id) on delete set null,
  order_index       int not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index project_tasks_project_idx  on public.project_tasks (project_id, order_index);
create index project_tasks_assignee_idx on public.project_tasks (assignee_id);
create index project_tasks_module_idx   on public.project_tasks (project_module_id);

create trigger project_tasks_touch before update on public.project_tasks
  for each row execute function public.touch_updated_at();
create trigger project_tasks_touch_project
  after insert or update or delete on public.project_tasks
  for each row execute function public.touch_project();

-- ── access helpers ─────────────────────────────────────────────────────────
create or replace function public.can_view_project(p uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.projects
    where id = p and (user_id = (select auth.uid()) or is_example)
  ) or exists (
    select 1 from public.project_members
    where project_id = p and user_id = (select auth.uid())
  );
$$;

create or replace function public.can_edit_project(p uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.projects
    where id = p and user_id = (select auth.uid())
  ) or exists (
    select 1 from public.project_members
    where project_id = p and user_id = (select auth.uid()) and role = 'editor'
  );
$$;

-- owner of the module's project, or an editor with a task on that module
create or replace function public.can_edit_module(pm uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.project_modules m
    join public.projects pr on pr.id = m.project_id
    where m.id = pm and pr.user_id = (select auth.uid())
  ) or exists (
    select 1 from public.project_tasks t
    where t.project_module_id = pm and t.assignee_id = (select auth.uid())
  );
$$;

-- redeem a share link: security definer so the joiner can insert their own
-- membership without a broad insert policy. Returns the project id.
create or replace function public.redeem_invite(invite_token text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  inv public.project_invites;
  uid uuid := (select auth.uid());
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  select * into inv from public.project_invites
    where token = invite_token and revoked_at is null;
  if not found then
    raise exception 'invite not found';
  end if;
  if exists (select 1 from public.projects where id = inv.project_id and user_id = uid) then
    return inv.project_id; -- owner opened their own link
  end if;
  insert into public.project_members (project_id, user_id, role, added_by)
  values (
    inv.project_id, uid,
    case when inv.access = 'edit' then 'editor'::public.member_role
         else 'viewer'::public.member_role end,
    inv.created_by
  )
  on conflict (project_id, user_id) do update
    set role = case when inv.access = 'edit' then 'editor'::public.member_role
                    else excluded.role end;
  return inv.project_id;
end;
$$;

-- preview a share link before joining (invites themselves are owner-only RLS)
create or replace function public.invite_info(invite_token text)
returns table (project_id uuid, project_title text, access public.share_access, owner_name text)
language sql stable security definer set search_path = '' as $$
  select p.id, p.title, i.access,
         coalesce(pr.display_name, pr.username, 'Someone')
  from public.project_invites i
  join public.projects p on p.id = i.project_id
  left join public.profiles pr on pr.id = p.user_id
  where i.token = invite_token and i.revoked_at is null;
$$;

-- ── RLS ────────────────────────────────────────────────────────────────────
alter table public.project_members enable row level security;
alter table public.project_invites enable row level security;
alter table public.project_tasks   enable row level security;

-- members: everyone on the project can see the roster; only the owner edits it,
-- and anyone can remove themselves.
create policy "members read" on public.project_members
  for select using (public.can_view_project(project_id));
create policy "owner manages members" on public.project_members
  for all using (public.owns_project(project_id))
  with check (public.owns_project(project_id));
create policy "leave project" on public.project_members
  for delete using (user_id = (select auth.uid()));

-- invites: owner only. redeem_invite (security definer) handles the join path.
create policy "owner manages invites" on public.project_invites
  for all using (public.owns_project(project_id))
  with check (public.owns_project(project_id));

-- tasks: any collaborator can read; owner writes; an assignee can update their
-- own task (state changes — column scope enforced in the server action).
create policy "tasks read" on public.project_tasks
  for select using (public.can_view_project(project_id));
create policy "owner manages tasks" on public.project_tasks
  for all using (public.owns_project(project_id))
  with check (public.owns_project(project_id));
create policy "assignee updates task" on public.project_tasks
  for update using (assignee_id = (select auth.uid()))
  with check (assignee_id = (select auth.uid()));

-- ── widen read access on the project + its children to collaborators ───────
create policy "collaborators read project" on public.projects
  for select using (public.can_view_project(id));

do $$
declare t text;
begin
  foreach t in array array[
    'project_modules', 'entries', 'rants', 'questions', 'links',
    'brainstorm_sessions', 'canvases', 'gap_dismissals', 'activity', 'artifacts'
  ]
  loop
    execute format(
      'create policy "collaborators read" on public.%I
         for select using (public.can_view_project(project_id))', t);
  end loop;
end;
$$;

create policy "collaborators read" on public.brainstorm_responses
  for select using (exists (
    select 1 from public.brainstorm_sessions s
    where s.id = session_id and public.can_view_project(s.project_id)
  ));

-- editors write entries, but only inside a module assigned to them
create policy "assignee writes entries" on public.entries
  for all using (public.can_edit_module(project_module_id))
  with check (public.can_edit_module(project_module_id));
