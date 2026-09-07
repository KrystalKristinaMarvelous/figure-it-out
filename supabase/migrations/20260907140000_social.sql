-- Follows + direct messages. (Project collaboration is a separate migration.)

-- Denormalised resolved-question count so profiles can show it without
-- reading another user's questions.
alter table public.projects add column if not exists resolved_count int not null default 0;

update public.projects p set resolved_count = (
  select count(*) from public.questions q where q.project_id = p.id and q.status = 'resolved'
);

create or replace function public.bump_resolved_count()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'UPDATE' then
    if new.status = 'resolved' and old.status <> 'resolved' then
      update public.projects set resolved_count = resolved_count + 1 where id = new.project_id;
    elsif old.status = 'resolved' and new.status <> 'resolved' then
      update public.projects set resolved_count = greatest(0, resolved_count - 1) where id = new.project_id;
    end if;
  elsif tg_op = 'DELETE' and old.status = 'resolved' then
    update public.projects set resolved_count = greatest(0, resolved_count - 1) where id = old.project_id;
  end if;
  return coalesce(new, old);
end;
$$;
create trigger questions_resolved_count
  after update or delete on public.questions
  for each row execute function public.bump_resolved_count();

-- ── follows ──────────────────────────────────────────────────────────────
create table public.follows (
  follower_id  uuid not null references public.users (id) on delete cascade,
  following_id uuid not null references public.users (id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint no_self_follow check (follower_id <> following_id)
);
alter table public.follows enable row level security;
create policy "follows readable when signed in" on public.follows
  for select using ((select auth.uid()) is not null);
create policy "follow" on public.follows
  for insert with check ((select auth.uid()) = follower_id);
create policy "unfollow" on public.follows
  for delete using ((select auth.uid()) = follower_id);
create index follows_following_idx on public.follows (following_id);

-- ── messages ─────────────────────────────────────────────────────────────
create table public.messages (
  id           uuid primary key default gen_random_uuid(),
  sender_id    uuid not null references public.users (id) on delete cascade,
  recipient_id uuid not null references public.users (id) on delete cascade,
  body         text not null,
  read_at      timestamptz,
  created_at   timestamptz not null default now(),
  constraint no_self_message check (sender_id <> recipient_id)
);
alter table public.messages enable row level security;
create policy "read own messages" on public.messages
  for select using ((select auth.uid()) in (sender_id, recipient_id));
create policy "send message" on public.messages
  for insert with check ((select auth.uid()) = sender_id);
create policy "mark received read" on public.messages
  for update using ((select auth.uid()) = recipient_id)
  with check ((select auth.uid()) = recipient_id);
create index messages_from_idx on public.messages (sender_id, recipient_id, created_at);
create index messages_to_idx on public.messages (recipient_id, sender_id, created_at);
