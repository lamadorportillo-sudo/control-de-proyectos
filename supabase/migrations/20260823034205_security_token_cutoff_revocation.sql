alter table public.profiles
  add column if not exists security_valid_after timestamptz not null default '1970-01-01 00:00:00+00';

create or replace function private.bump_security_valid_after()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if (
    (new.security_force_reauth is true and old.security_force_reauth is distinct from true)
    or (new.active is false and old.active is distinct from false)
  ) then
    new.security_valid_after := date_trunc('second', now());
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_security_valid_after_trg on public.profiles;
create trigger profiles_security_valid_after_trg
before update on public.profiles
for each row execute function private.bump_security_valid_after();

create or replace function private.account_access_allowed()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.active = true
      and p.security_force_reauth = false
      and coalesce(
        to_timestamp(nullif(auth.jwt()->>'iat','')::double precision),
        '1970-01-01 00:00:00+00'::timestamptz
      ) >= p.security_valid_after
      and (
        p.must_change_password = false
        or (p.temporary_password_expires_at is not null and p.temporary_password_expires_at > now())
      )
  );
$$;
