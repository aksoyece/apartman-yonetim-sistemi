-- Akıllı Anket / Karar Alma

do $$ begin
  create type public.survey_status as enum ('draft', 'open', 'closed');
exception when duplicate_object then null;
end $$;

create table if not exists public.surveys (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status public.survey_status not null default 'draft',
  ends_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.survey_options (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references public.surveys (id) on delete cascade,
  label text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.survey_votes (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references public.surveys (id) on delete cascade,
  option_id uuid not null references public.survey_options (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (survey_id, user_id)
);

create index if not exists surveys_status_idx on public.surveys (status, created_at desc);
create index if not exists survey_options_survey_id_idx on public.survey_options (survey_id, sort_order);
create index if not exists survey_votes_survey_id_idx on public.survey_votes (survey_id);
create index if not exists survey_votes_option_id_idx on public.survey_votes (option_id);

drop trigger if exists surveys_updated_at on public.surveys;
create trigger surveys_updated_at before update on public.surveys
  for each row execute function public.set_updated_at();

alter table public.surveys enable row level security;
alter table public.survey_options enable row level security;
alter table public.survey_votes enable row level security;

drop policy if exists "Surveys: admin full" on public.surveys;
drop policy if exists "Surveys: resident read published" on public.surveys;
drop policy if exists "Survey options: admin full" on public.survey_options;
drop policy if exists "Survey options: resident read published" on public.survey_options;
drop policy if exists "Survey votes: admin read" on public.survey_votes;
drop policy if exists "Survey votes: resident read" on public.survey_votes;
drop policy if exists "Survey votes: resident insert own" on public.survey_votes;

create policy "Surveys: admin full" on public.surveys
  for all using (public.is_admin()) with check (public.is_admin());

create policy "Surveys: resident read published" on public.surveys
  for select using (auth.uid() is not null and status in ('open', 'closed'));

create policy "Survey options: admin full" on public.survey_options
  for all using (public.is_admin()) with check (public.is_admin());

create policy "Survey options: resident read published" on public.survey_options
  for select using (
    auth.uid() is not null
    and exists (
      select 1 from public.surveys s
      where s.id = survey_id and s.status in ('open', 'closed')
    )
  );

create policy "Survey votes: admin read" on public.survey_votes
  for select using (public.is_admin());

create policy "Survey votes: resident read" on public.survey_votes
  for select using (auth.uid() is not null);

create policy "Survey votes: resident insert own" on public.survey_votes
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.surveys s
      where s.id = survey_id
        and s.status = 'open'
        and (s.ends_at is null or s.ends_at > now())
    )
    and exists (
      select 1 from public.survey_options o
      where o.id = option_id and o.survey_id = survey_id
    )
  );

-- Kat maliki güvenli oy verme
create or replace function public.resident_cast_vote(
  p_survey_id uuid,
  p_option_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_survey public.surveys%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Oturum gerekli';
  end if;

  select * into v_survey from public.surveys where id = p_survey_id;
  if not found then
    raise exception 'Anket bulunamadi';
  end if;

  if v_survey.status <> 'open' then
    raise exception 'Bu anket oylamaya acik degil';
  end if;

  if v_survey.ends_at is not null and v_survey.ends_at <= now() then
    raise exception 'Anket suresi dolmus';
  end if;

  if not exists (
    select 1 from public.survey_options
    where id = p_option_id and survey_id = p_survey_id
  ) then
    raise exception 'Gecersiz secenek';
  end if;

  insert into public.survey_votes (survey_id, option_id, user_id)
  values (p_survey_id, p_option_id, auth.uid())
  on conflict (survey_id, user_id) do update
    set option_id = excluded.option_id
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.resident_cast_vote(uuid, uuid) from public;
grant execute on function public.resident_cast_vote(uuid, uuid) to authenticated;
