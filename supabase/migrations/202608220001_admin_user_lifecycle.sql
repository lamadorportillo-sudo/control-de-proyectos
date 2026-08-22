alter table public.profiles
  add column if not exists must_change_password boolean not null default false,
  add column if not exists temporary_password_expires_at timestamptz;

create index if not exists profiles_temporary_password_expiry_idx
  on public.profiles (temporary_password_expires_at)
  where must_change_password;

update public.profiles p
set must_change_password = true,
    temporary_password_expires_at = coalesce(
      (select u.created_at + interval '24 hours' from auth.users u where u.id = p.user_id),
      now() + interval '24 hours'
    ),
    updated_at = now()
where p.user_id = (select id from auth.users where lower(email) = 'hardmy25@yahoo.es' limit 1);
