-- Örnek / yardımcı seed
-- Not: Kullanıcılar Auth üzerinden oluşturulmalıdır.
-- Bu script, mevcut bir yönetici ve kat maliki UUID'leri ile örnek veri eklemek içindir.
-- Aşağıdaki UUID'leri kendi auth.users id'lerinizle değiştirin.

-- Örnek kullanım (UUID'leri güncelleyin):
/*
do $$
declare
  admin_id uuid := '00000000-0000-0000-0000-000000000001';
  resident_id uuid := '00000000-0000-0000-0000-000000000002';
  apt_id uuid;
  due_id uuid;
begin
  update public.profiles set role = 'admin', full_name = 'Site Yöneticisi' where id = admin_id;
  update public.profiles set role = 'resident', full_name = 'Ahmet Yılmaz', phone = '05320000000' where id = resident_id;

  insert into public.apartments (number, floor, block, owner_id, area_m2)
  values ('12', 3, 'A', resident_id, 110)
  returning id into apt_id;

  insert into public.dues (apartment_id, amount, due_date, period, status, description)
  values (apt_id, 1500, current_date + 10, to_char(current_date, 'YYYY-MM'), 'pending', 'Aylık aidat')
  returning id into due_id;

  insert into public.expenses (title, amount, category, expense_date, description, created_by)
  values ('Asansör bakımı', 4500, 'asansör', current_date, 'Periyodik bakım', admin_id);

  insert into public.announcements (title, content, priority, created_by)
  values ('Su kesintisi', 'Yarın 10:00-14:00 arası su kesintisi olacaktır.', 'high', admin_id);

  insert into public.maintenance_requests (apartment_id, reporter_id, title, description, priority)
  values (apt_id, resident_id, 'Kapı kilidi arızası', 'Daire kapısı zor kilitleniyor.', 'normal');
end $$;
*/
