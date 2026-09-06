-- Example projects for the dashboard empty state (spec §16). Read-only to all
-- signed-in users; owned by no one.

-- allow reading example projects' children
create or replace function public.project_is_example(p uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.projects where id = p and is_example);
$$;

do $$
declare t text;
begin
  foreach t in array array['project_modules', 'entries', 'questions', 'rants', 'activity']
  loop
    execute format(
      'create policy "read examples" on public.%I for select
         using (public.project_is_example(project_id))', t);
  end loop;
end;
$$;

-- ── the three examples ─────────────────────────────────────────────────────
insert into public.projects
  (id, user_id, title, one_liner, original_one_liner, category, subtype,
   spec_tags, readiness, status, lifecycle, is_example, target_type, target_value)
values
  ('00000000-0000-4000-8000-000000000101', null,
   'The Winter Crown',
   'A princess discovers that her sister''s death may have been arranged by the court.',
   'Something about a cold palace and a girl who trusts no one.',
   'creative', 'novel', array['fantasy','literary'], 'vague', 'developing', 'active', true,
   'words', 80000),
  ('00000000-0000-4000-8000-000000000102', null,
   'Does classroom lighting affect focus?',
   'Testing whether warmer light in the afternoon improves sustained attention in Year 9.',
   'I keep noticing everyone fades after lunch.',
   'academic', 'science_project', array['fair entry'], 'defined', 'building', 'active', true,
   null, null),
  ('00000000-0000-4000-8000-000000000103', null,
   'Two weeks, Portugal',
   'Lisbon, the Alentejo, and the south coast — slow, mostly by train.',
   'somewhere warm, not too planned',
   'personal', 'trip', array['two weeks','road trip'], 'seed', 'seed', 'active', true,
   'money', 3000)
on conflict (id) do nothing;

-- a few modules + entries + questions so the examples aren't hollow
do $$
declare
  novel uuid := '00000000-0000-4000-8000-000000000101';
  sci   uuid := '00000000-0000-4000-8000-000000000102';
  trip  uuid := '00000000-0000-4000-8000-000000000103';
  pm_char uuid; pm_prem uuid; pm_hyp uuid; pm_places uuid;
  d_id uuid;
begin
  -- novel: premise + characters
  select id into d_id from public.module_definitions where key = 'premise' and author_id is null;
  insert into public.project_modules (project_id, module_definition_id, order_index)
    values (novel, d_id, 0) returning id into pm_prem;
  insert into public.entries (project_id, project_module_id, title, values) values
    (novel, pm_prem, 'A princess discovers her sister''s death was arranged',
     jsonb_build_object(
       'logline','A princess discovers that her sister''s death may have been arranged by the court.',
       'conflict','Raven wants the truth; the court needs the succession to stay contested.',
       'stakes','If she names the killer she loses her only ally and possibly the throne.'));

  select id into d_id from public.module_definitions where key = 'characters' and author_id is null;
  insert into public.project_modules (project_id, module_definition_id, order_index)
    values (novel, d_id, 1) returning id into pm_char;
  insert into public.entries (project_id, project_module_id, title, values) values
    (novel, pm_char, 'Raven', jsonb_build_object(
      'name','Raven','role','Protagonist',
      'want','To prove her sister was murdered','need','To stop measuring herself against a dead girl',
      'lie','That she was never the one meant to rule')),
    (novel, pm_char, 'Irae', jsonb_build_object(
      'name','Irae','role','Antagonist',
      'want','To keep the succession contested long enough to install his own claimant'));

  insert into public.questions (project_id, text, priority, source) values
    (novel, 'How does the succession actually work?', 'blocking', 'manual'),
    (novel, 'Why does the antagonist need the princess alive?', 'important', 'gap');

  -- science: hypothesis
  select id into d_id from public.module_definitions where key = 'hypothesis' and author_id is null;
  insert into public.project_modules (project_id, module_definition_id, order_index)
    values (sci, d_id, 0) returning id into pm_hyp;
  insert into public.entries (project_id, project_module_id, title, values) values
    (sci, pm_hyp, 'Warmer afternoon light improves attention', jsonb_build_object(
      'prediction','If the classroom light is shifted warmer after lunch, then sustained-attention scores rise.',
      'because','Cooler light suppresses melatonin; the afternoon dip may be partly lighting, not just food.',
      'null','No difference in attention scores between lighting conditions.'));
  insert into public.questions (project_id, text, priority, source) values
    (sci, 'What''s a fair way to measure sustained attention in a lesson?', 'important', 'manual');

  -- trip: places
  select id into d_id from public.module_definitions where key = 'trip_places' and author_id is null;
  insert into public.project_modules (project_id, module_definition_id, order_index)
    values (trip, d_id, 0) returning id into pm_places;
  insert into public.entries (project_id, project_module_id, title, values) values
    (trip, pm_places, 'Lisbon', jsonb_build_object('name','Lisbon','why','Start here — trains fan out everywhere.','time_needed','3–4 days')),
    (trip, pm_places, 'Évora', jsonb_build_object('name','Évora','why','Alentejo base, walkable, good food.','time_needed','2 days'));
  insert into public.questions (project_id, text, priority, source) values
    (trip, 'North to south, or a loop?', 'important', 'manual');
end;
$$;
