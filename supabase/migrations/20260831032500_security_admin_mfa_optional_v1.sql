-- 2FA queda como protección opcional. Se elimina la obligación administrativa por fecha.

drop trigger if exists workspace_members_admin_mfa_deadline_trg on public.workspace_members;
drop function if exists private.sync_admin_mfa_deadline();

update public.profiles
set mfa_required_after = null,
    updated_at = now()
where mfa_required_after is not null;

create or replace function private.keep_mfa_optional()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  new.mfa_required_after := null;
  return new;
end;
$$;

revoke all on function private.keep_mfa_optional() from public, anon, authenticated;

drop trigger if exists profiles_mfa_optional_insert_trg on public.profiles;
create trigger profiles_mfa_optional_insert_trg
before insert on public.profiles
for each row execute function private.keep_mfa_optional();

drop trigger if exists profiles_mfa_optional_update_trg on public.profiles;
create trigger profiles_mfa_optional_update_trg
before update of mfa_required_after on public.profiles
for each row execute function private.keep_mfa_optional();

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
      -- Si el propio usuario activó MFA, se conserva la protección AAL2.
      and (
        not exists (
          select 1
          from auth.mfa_factors f
          where f.user_id = p.user_id
            and f.status = 'verified'
        )
        or coalesce(auth.jwt()->>'aal','aal1') = 'aal2'
      )
  );
$$;

revoke all on function private.account_access_allowed() from public, anon, authenticated;
grant execute on function private.account_access_allowed() to authenticated;

comment on column public.profiles.mfa_required_after is
  'Campo legado. La verificación en dos pasos es opcional; este valor se mantiene en NULL.';
