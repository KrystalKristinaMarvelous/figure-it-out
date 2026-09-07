-- Public profiles (visible to any signed-in FIO user) — separate from the
-- private `users` row which holds settings/email.

create table public.profiles (
  id           uuid primary key references public.users (id) on delete cascade,
  username     text unique,
  display_name text,
  headline     text,
  bio          text,
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles readable when signed in" on public.profiles
  for select using ((select auth.uid()) is not null);
create policy "insert own profile" on public.profiles
  for insert with check ((select auth.uid()) = id);
create policy "update own profile" on public.profiles
  for update using ((select auth.uid()) = id);

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Backfill for existing users.
insert into public.profiles (id, display_name)
select id, display_name from public.users
on conflict (id) do nothing;

-- Feature an in-progress project on your profile ("what I'm working on").
alter table public.projects add column if not exists show_on_profile boolean not null default false;

-- Portfolio items — finished work, on-app or external.
create table public.portfolio_items (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.users (id) on delete cascade,
  title          text not null,
  kind           text,
  year           int,
  blurb          text,
  link_url       text,
  image_url      text,
  from_project_id uuid references public.projects (id) on delete set null,
  order_index    int not null default 0,
  created_at     timestamptz not null default now()
);
alter table public.portfolio_items enable row level security;
create policy "portfolio readable when signed in" on public.portfolio_items
  for select using ((select auth.uid()) is not null);
create policy "owner writes portfolio" on public.portfolio_items
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create index portfolio_items_user_idx on public.portfolio_items (user_id, order_index);

-- Let signed-in users read profile-featured / finished projects (+ their entries)
create policy "read featured projects" on public.projects
  for select using (
    (select auth.uid()) is not null
    and (lifecycle = 'finished' or show_on_profile)
  );

-- Recreate the new-user trigger to also seed a profile and capture OAuth fields.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  nm text := coalesce(
    new.raw_user_meta_data ->> 'display_name',
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    split_part(new.email, '@', 1)
  );
  av text := new.raw_user_meta_data ->> 'avatar_url';
begin
  insert into public.users (id, email, display_name)
  values (new.id, new.email, nm)
  on conflict (id) do nothing;

  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, nm, av)
  on conflict (id) do nothing;

  return new;
end;
$$;
