-- =============================================================================
-- Storage buckets and policies.
--
--   media   - profile photo, project thumbnails, certification/achievement images
--   resumes - resume PDFs
--
-- Both buckets are public, so files are served by public URL without any
-- policy. Only admin can list, upload, replace, or delete files.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('media', 'media', true, 5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('resumes', 'resumes', true, 10485760,
    array['application/pdf'])
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "Admin read portfolio files"
  on storage.objects for select to authenticated
  using (bucket_id in ('media', 'resumes') and (select public.is_admin()));

create policy "Admin upload portfolio files"
  on storage.objects for insert to authenticated
  with check (bucket_id in ('media', 'resumes') and (select public.is_admin()));

create policy "Admin update portfolio files"
  on storage.objects for update to authenticated
  using (bucket_id in ('media', 'resumes') and (select public.is_admin()))
  with check (bucket_id in ('media', 'resumes') and (select public.is_admin()));

create policy "Admin delete portfolio files"
  on storage.objects for delete to authenticated
  using (bucket_id in ('media', 'resumes') and (select public.is_admin()));
