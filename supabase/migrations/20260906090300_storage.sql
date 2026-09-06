-- Storage buckets: rant audio (private) and finished-work artifacts (private).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('audio', 'audio', false, 52428800,
   array['audio/webm','audio/mp4','audio/mpeg','audio/wav','audio/ogg','audio/x-m4a']),
  ('artifacts', 'artifacts', false, 52428800, null),
  ('inspiration', 'inspiration', false, 26214400,
   array['image/png','image/jpeg','image/webp','image/gif','image/avif'])
on conflict (id) do nothing;

-- Objects are foldered by user id: `<uid>/<project>/<file>`.
create policy "own audio read" on storage.objects for select
  using (bucket_id = 'audio' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "own audio write" on storage.objects for insert
  with check (bucket_id = 'audio' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "own audio delete" on storage.objects for delete
  using (bucket_id = 'audio' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "own artifacts read" on storage.objects for select
  using (bucket_id = 'artifacts' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "own artifacts write" on storage.objects for insert
  with check (bucket_id = 'artifacts' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "own artifacts delete" on storage.objects for delete
  using (bucket_id = 'artifacts' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "own inspiration read" on storage.objects for select
  using (bucket_id = 'inspiration' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "own inspiration write" on storage.objects for insert
  with check (bucket_id = 'inspiration' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "own inspiration delete" on storage.objects for delete
  using (bucket_id = 'inspiration' and (storage.foldername(name))[1] = (select auth.uid())::text);
