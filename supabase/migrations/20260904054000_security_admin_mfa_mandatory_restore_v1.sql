-- Restablece la política coherente con la interfaz y las Edge Functions:
-- MFA es obligatorio para administradores después de un periodo de preparación.

alter table public.profiles
  add column if not exists mfa_required_after timestamptz;

-- Retirar la política posterior que anulaba permanentemente el vencimiento MFA.
drop trigger if exists profiles_mfa_optional_insert_trg on public.profiles;
drop trigger if exists profiles_mfa_optional_update_trg on public.profiles;
drop function if exists private.keep_mfa_optional();

-- Los administradores activos que todavía no tienen fecha reciben 72 horas para
-- configurar el segundo factor. Una cuenta con factor verificado sigue exigiendo AAL2.
update public.profiles p
set mfa_required_after = coalesce(p.mfa_required_after, date_trunc('second', now() + interval '72 hours')),
    updated_at = now()
where exists (
  select 1
  from public.workspace_members wm
  where wm.user_id = p.user_id
    and wm.role = 'admin'
    and wm.active = true
);

-- Las cuentas que no son administradoras no necesitan un vencimiento obligatorio.
update public.profiles p
set mfa_required_after = null,
    updated_at = now()
where p.mfa_required_after is not null
  and not exists (
    select 1
    from public.workspace_members wm
    where wm.user_id = p.user_id
      and wm.role = 'admin'
      and wm.active = true
  );

create or replace function private.sync_admin_mfa_deadline()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.role = 'admin' and new.active = true then
    update public.profiles
    set mfa_required_after = coalesce(mfa_required_after, date_trunc('second', now() + interval '72 hours')),
        updated_at = now()
    where user_id = new.user_id;
  elsif tg_op = 'UPDATE' then
    if not exists (
      select 1
      from public.workspace_members wm
      where wm.user_id = new.user_id
        and wm.role = 'admin'
        and wm.active = true
    ) then
      update public.profiles
      set mfa_required_after = null,
          updated_at = now()
      where user_id = new.user_id;
    end if;
  end if;
  return new;
end;
$$;

revoke all on function private.sync_admin_mfa_deadline() from public, anon, authenticated;

drop trigger if exists workspace_members_admin_mfa_deadline_trg on public.workspace_members;
create trigger workspace_members_admin_mfa_deadline_trg
after insert or update of role, active on public.workspace_members
for each row execute function private.sync_admin_mfa_deadline();

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
      and (
        not exists (
          select 1
          from auth.mfa_factors f
          where f.user_id = p.user_id
            and f.status = 'verified'
        )
        or coalesce(auth.jwt()->>'aal','aal1') = 'aal2'
      )
      and (
        not exists (
          select 1
          from public.workspace_members wm
          where wm.user_id = p.user_id
            and wm.role = 'admin'
            and wm.active = true
        )
        or p.mfa_required_after is null
        or now() < p.mfa_required_after
        or exists (
          select 1
          from auth.mfa_factors f2
          where f2.user_id = p.user_id
            and f2.status = 'verified'
        )
      )
  );
$$;

revoke all on function private.account_access_allowed() from public, anon, authenticated;
grant execute on function private.account_access_allowed() to authenticated;

create index if not exists profiles_mfa_required_after_idx
  on public.profiles (mfa_required_after)
  where mfa_required_after is not null;

comment on column public.profiles.mfa_required_after is
  'Fecha a partir de la cual una cuenta administradora debe tener un factor MFA verificado y usar AAL2.';
