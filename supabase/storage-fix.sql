-- Fix storage RLS for attachments bucket

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'attachments',
  'attachments',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Attachments: authenticated read own or admin" on storage.objects;
drop policy if exists "Attachments: authenticated upload own folder" on storage.objects;
drop policy if exists "Attachments: owner or admin delete" on storage.objects;
drop policy if exists "Attachments: authenticated update own folder" on storage.objects;

create policy "Attachments: authenticated read own or admin"
on storage.objects for select to authenticated
using (
  bucket_id = 'attachments'
  and (
    public.is_admin()
    or name like auth.uid()::text || '/%'
  )
);

create policy "Attachments: authenticated upload own folder"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'attachments'
  and name like auth.uid()::text || '/%'
);

create policy "Attachments: authenticated update own folder"
on storage.objects for update to authenticated
using (
  bucket_id = 'attachments'
  and (
    public.is_admin()
    or name like auth.uid()::text || '/%'
  )
)
with check (
  bucket_id = 'attachments'
  and (
    public.is_admin()
    or name like auth.uid()::text || '/%'
  )
);

create policy "Attachments: owner or admin delete"
on storage.objects for delete to authenticated
using (
  bucket_id = 'attachments'
  and (
    public.is_admin()
    or name like auth.uid()::text || '/%'
  )
);
