-- Apartman Yönetim Sistemi - Supabase PostgreSQL Schema
-- Bu dosyayı Supabase SQL Editor'de çalıştırın.

-- Enums
create type public.user_role as enum ('admin', 'resident');
create type public.due_status as enum ('pending', 'paid', 'overdue', 'partial');
create type public.payment_method as enum ('cash', 'transfer', 'credit_card', 'other');
create type public.maintenance_status as enum ('open', 'in_progress', 'resolved', 'closed');
create type public.priority_level as enum ('low', 'normal', 'high');

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  phone text,
  email text,
  role public.user_role not null default 'resident',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Apartments
create table public.apartments (
  id uuid primary key default gen_random_uuid(),
  number text not null,
  floor integer not null default 0,
  block text,
  owner_id uuid references public.profiles (id) on delete set null,
  area_m2 numeric(10, 2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (block, number)
);

-- Dues (Aidatlar)
create table public.dues (
  id uuid primary key default gen_random_uuid(),
  apartment_id uuid not null references public.apartments (id) on delete cascade,
  amount numeric(12, 2) not null check (amount >= 0),
  due_date date not null,
  period text not null,
  status public.due_status not null default 'pending',
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Payments
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  due_id uuid references public.dues (id) on delete set null,
  apartment_id uuid not null references public.apartments (id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  payment_date date not null default current_date,
  method public.payment_method not null default 'transfer',
  notes text,
  recorded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

-- Expenses
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  amount numeric(12, 2) not null check (amount > 0),
  category text not null default 'genel',
  expense_date date not null default current_date,
  description text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

-- Announcements
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  priority public.priority_level not null default 'normal',
  is_active boolean not null default true,
  published_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

-- Maintenance requests
create table public.maintenance_requests (
  id uuid primary key default gen_random_uuid(),
  apartment_id uuid not null references public.apartments (id) on delete cascade,
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text not null,
  status public.maintenance_status not null default 'open',
  priority public.priority_level not null default 'normal',
  admin_notes text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index apartments_owner_id_idx on public.apartments (owner_id);
create index dues_apartment_id_idx on public.dues (apartment_id);
create index dues_status_idx on public.dues (status);
create index payments_apartment_id_idx on public.payments (apartment_id);
create index payments_payment_date_idx on public.payments (payment_date desc);
create index expenses_expense_date_idx on public.expenses (expense_date desc);
create index announcements_published_at_idx on public.announcements (published_at desc);
create index maintenance_status_idx on public.maintenance_requests (status);
create index maintenance_reporter_id_idx on public.maintenance_requests (reporter_id);

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger apartments_updated_at before update on public.apartments
  for each row execute function public.set_updated_at();
create trigger dues_updated_at before update on public.dues
  for each row execute function public.set_updated_at();
create trigger maintenance_updated_at before update on public.maintenance_requests
  for each row execute function public.set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'resident'),
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper: is admin
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Helper: owns apartment
create or replace function public.owns_apartment(apt_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.apartments
    where id = apt_id and owner_id = auth.uid()
  );
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.apartments enable row level security;
alter table public.dues enable row level security;
alter table public.payments enable row level security;
alter table public.expenses enable row level security;
alter table public.announcements enable row level security;
alter table public.maintenance_requests enable row level security;

-- Profiles policies
create policy "Profiles: users can read own" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "Profiles: admin full access" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());
create policy "Profiles: users can update own" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

-- Apartments policies
create policy "Apartments: admin full" on public.apartments
  for all using (public.is_admin()) with check (public.is_admin());
create policy "Apartments: resident read own" on public.apartments
  for select using (owner_id = auth.uid());

-- Dues policies
create policy "Dues: admin full" on public.dues
  for all using (public.is_admin()) with check (public.is_admin());
create policy "Dues: resident read own" on public.dues
  for select using (public.owns_apartment(apartment_id));

-- Payments policies
create policy "Payments: admin full" on public.payments
  for all using (public.is_admin()) with check (public.is_admin());
create policy "Payments: resident read own" on public.payments
  for select using (public.owns_apartment(apartment_id));

-- Expenses policies
create policy "Expenses: admin full" on public.expenses
  for all using (public.is_admin()) with check (public.is_admin());
create policy "Expenses: resident read" on public.expenses
  for select using (auth.uid() is not null);

-- Announcements policies
create policy "Announcements: admin full" on public.announcements
  for all using (public.is_admin()) with check (public.is_admin());
create policy "Announcements: authenticated read active" on public.announcements
  for select using (auth.uid() is not null and is_active = true);

-- Maintenance policies
create policy "Maintenance: admin full" on public.maintenance_requests
  for all using (public.is_admin()) with check (public.is_admin());
create policy "Maintenance: resident read own" on public.maintenance_requests
  for select using (reporter_id = auth.uid() or public.owns_apartment(apartment_id));
create policy "Maintenance: resident insert own" on public.maintenance_requests
  for insert with check (
    reporter_id = auth.uid()
    and public.owns_apartment(apartment_id)
  );
