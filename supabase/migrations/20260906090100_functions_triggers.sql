-- Triggers: updated_at, last_touched, full-text search vectors, activity feed.

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger entries_touch before update on public.entries
  for each row execute function public.touch_updated_at();
create trigger projects_touch before update on public.projects
  for each row execute function public.touch_updated_at();

-- Bump the project's last_touched_at on any child write.
create or replace function public.touch_project()
returns trigger language plpgsql security definer set search_path = '' as $$
declare pid uuid;
begin
  pid := coalesce(new.project_id, old.project_id);
  update public.projects set last_touched_at = now() where id = pid;
  return coalesce(new, old);
end;
$$;

create trigger entries_touch_project after insert or update or delete on public.entries
  for each row execute function public.touch_project();
create trigger rants_touch_project after insert on public.rants
  for each row execute function public.touch_project();
create trigger questions_touch_project after insert or update on public.questions
  for each row execute function public.touch_project();

-- Full-text search vectors -----------------------------------------------------
create or replace function public.entries_tsv()
returns trigger language plpgsql as $$
begin
  new.search_tsv :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(
      (select string_agg(value, ' ') from jsonb_each_text(new.values)), '')), 'B');
  return new;
end;
$$;
create trigger entries_tsv_trg before insert or update on public.entries
  for each row execute function public.entries_tsv();

create or replace function public.rants_tsv()
returns trigger language plpgsql as $$
begin
  new.search_tsv :=
    setweight(to_tsvector('english', coalesce(new.body_text, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.transcript, '')), 'B');
  return new;
end;
$$;
create trigger rants_tsv_trg before insert or update on public.rants
  for each row execute function public.rants_tsv();

create or replace function public.questions_tsv()
returns trigger language plpgsql as $$
begin
  new.search_tsv :=
    setweight(to_tsvector('english', coalesce(new.text, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.answer, '')), 'B');
  return new;
end;
$$;
create trigger questions_tsv_trg before insert or update on public.questions
  for each row execute function public.questions_tsv();

-- Activity feed ---------------------------------------------------------------
create or replace function public.log_activity()
returns trigger language plpgsql security definer set search_path = '' as $$
declare pid uuid; k text; st text;
begin
  st := tg_argv[0];
  if tg_op = 'INSERT' then
    pid := new.project_id;
    k := st || '_created';
  elsif tg_op = 'UPDATE' then
    pid := new.project_id;
    if st = 'question' and new.status = 'resolved' and old.status <> 'resolved' then
      k := 'question_resolved';
    else
      return new;
    end if;
  end if;
  insert into public.activity (project_id, kind, subject_type, subject_id)
  values (pid, k, st, new.id);
  return new;
end;
$$;

create trigger entries_activity after insert on public.entries
  for each row execute function public.log_activity('entry');
create trigger questions_activity after insert or update on public.questions
  for each row execute function public.log_activity('question');
create trigger rants_activity after insert on public.rants
  for each row execute function public.log_activity('rant');
create trigger modules_activity after insert on public.project_modules
  for each row execute function public.log_activity('module');
create trigger brainstorm_activity after insert on public.brainstorm_sessions
  for each row execute function public.log_activity('brainstorm');

-- Progress helper: questions figured out vs open ------------------------------
create or replace function public.project_question_counts(p uuid)
returns table (resolved bigint, open bigint)
language sql stable as $$
  select
    count(*) filter (where status = 'resolved'),
    count(*) filter (where status <> 'resolved')
  from public.questions where project_id = p;
$$;
