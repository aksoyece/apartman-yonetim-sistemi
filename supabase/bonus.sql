-- Bonus özellikler (idempotent)

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  body text,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_id_idx on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "Notifications: users read own" on public.notifications;
drop policy if exists "Notifications: users update own" on public.notifications;
drop policy if exists "Notifications: admin insert" on public.notifications;
drop policy if exists "Notifications: users delete own" on public.notifications;

create policy "Notifications: users read own" on public.notifications
  for select using (auth.uid() = user_id);
create policy "Notifications: users update own" on public.notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Notifications: admin insert" on public.notifications
  for insert with check (public.is_admin() or auth.uid() = user_id);
create policy "Notifications: users delete own" on public.notifications
  for delete using (auth.uid() = user_id or public.is_admin());

alter table public.maintenance_requests
  add column if not exists attachment_path text;

alter table public.expenses
  add column if not exists attachment_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'attachments',
  'attachments',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do nothing;

drop policy if exists "Attachments: authenticated read own or admin" on storage.objects;
drop policy if exists "Attachments: authenticated upload own folder" on storage.objects;
drop policy if exists "Attachments: authenticated update own folder" on storage.objects;
drop policy if exists "Attachments: owner or admin delete" on storage.objects;

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
  and (public.is_admin() or name like auth.uid()::text || '/%')
)
with check (
  bucket_id = 'attachments'
  and (public.is_admin() or name like auth.uid()::text || '/%')
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

create or replace function public.notify_residents(p_title text, p_body text, p_link text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, title, body, link)
  select id, p_title, p_body, p_link
  from public.profiles
  where role = 'resident';
end;
$$;

create or replace function public.on_announcement_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.notify_residents(
    'Yeni duyuru: ' || new.title,
    left(new.content, 160),
    '/resident/announcements'
  );
  return new;
end;
$$;

drop trigger if exists announcement_notify on public.announcements;
create trigger announcement_notify
  after insert on public.announcements
  for each row
  when (new.is_active = true)
  execute function public.on_announcement_created();

create or replace function public.on_maintenance_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, title, body, link)
  select id, 'Yeni arıza bildirimi', new.title, '/admin/maintenance'
  from public.profiles
  where role = 'admin';
  return new;
end;
$$;

drop trigger if exists maintenance_notify on public.maintenance_requests;
create trigger maintenance_notify
  after insert on public.maintenance_requests
  for each row
  execute function public.on_maintenance_created();

create or replace function public.on_maintenance_status_updated()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    insert into public.notifications (user_id, title, body, link)
    values (
      new.reporter_id,
      'Arıza durumu güncellendi',
      new.title || ' → ' || new.status::text,
      '/resident/maintenance'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists maintenance_status_notify on public.maintenance_requests;
create trigger maintenance_status_notify
  after update on public.maintenance_requests
  for each row
  execute function public.on_maintenance_status_updated();

-- Kat maliki kendi aidatını ödeyebilir (demo ödeme)
create or replace function public.resident_pay_due(
  p_due_id uuid,
  p_method public.payment_method default 'transfer',
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_due public.dues%rowtype;
  v_payment_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Oturum gerekli';
  end if;

  select * into v_due from public.dues where id = p_due_id;
  if not found then
    raise exception 'Aidat bulunamadı';
  end if;

  if not public.owns_apartment(v_due.apartment_id) then
    raise exception 'Bu aidatı ödeme yetkiniz yok';
  end if;

  if v_due.status = 'paid' then
    raise exception 'Bu aidat zaten ödenmiş';
  end if;

  insert into public.payments (
    apartment_id, due_id, amount, payment_date, method, notes, recorded_by
  ) values (
    v_due.apartment_id,
    v_due.id,
    v_due.amount,
    current_date,
    p_method,
    coalesce(p_notes, 'Kat maliki ödemesi'),
    auth.uid()
  )
  returning id into v_payment_id;

  update public.dues
  set status = 'paid', updated_at = now()
  where id = v_due.id;

  return v_payment_id;
end;
$$;

revoke all on function public.resident_pay_due(uuid, public.payment_method, text) from public;
grant execute on function public.resident_pay_due(uuid, public.payment_method, text) to authenticated;

-- Kat maliki arıza bildirimi (RLS bypass güvenli RPC)
create or replace function public.resident_create_maintenance(
  p_apartment_id uuid,
  p_title text,
  p_description text,
  p_priority public.priority_level default 'normal',
  p_attachment_path text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Oturum gerekli';
  end if;

  if not public.owns_apartment(p_apartment_id) then
    raise exception 'Bu daire için arıza bildirme yetkiniz yok';
  end if;

  insert into public.maintenance_requests (
    apartment_id, reporter_id, title, description, priority, status, attachment_path
  ) values (
    p_apartment_id,
    auth.uid(),
    p_title,
    p_description,
    p_priority,
    'open',
    p_attachment_path
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.resident_create_maintenance(uuid, text, text, public.priority_level, text) from public;
grant execute on function public.resident_create_maintenance(uuid, text, text, public.priority_level, text) to authenticated;
