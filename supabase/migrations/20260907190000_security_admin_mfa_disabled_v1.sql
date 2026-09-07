-- Desactiva de forma permanente la obligación administrativa de MFA.
-- La protección 2FA queda disponible únicamente para usuarios que la activen voluntariamente.

alter table public.profiles
  add column if not exists mfa_required_after timestamptz;

drop trigger if exists workspace_members_admin_mfa_deadline_trg on public.workspace_members;
drop function if exists private.sync_admin_mfa_deadline();

-- Limpia las fechas y el bloqueo de reautenticación generado por la política anterior.
update public.profiles
set mfa_required_after = null,
    security_force_reauth = case when security_force_reauth then false else security_force_reauth end,
    updated_at = now()
where mfa_required_after is not null;

-- Evita que una actualización futura vuelva a colocar una fecha de obligación MFA.
create or replace function private.clear_mfa_deadline()
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

revoke all on function private.clear_mfa_deadline() from public, anon, authenticated;

drop trigger if exists profiles_mfa_deadline_guard_trg on public.profiles;
create trigger profiles_mfa_deadline_guard_trg
before insert or update of mfa_required_after on public.profiles
for each row execute function private.clear_mfa_deadline();

create or replace function private.clear_workspace_mfa_deadline()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.profiles
  set mfa_required_after = null,
      updated_at = now()
  where user_id = new.user_id;
  return new;
end;
$$;

revoke all on function private.clear_workspace_mfa_deadline() from public, anon, authenticated;

drop trigger if exists workspace_members_mfa_deadline_guard_trg on public.workspace_members;
create trigger workspace_members_mfa_deadline_guard_trg
after insert or update of role, active on public.workspace_members
for each row execute function private.clear_workspace_mfa_deadline();

-- Los administradores no quedan bloqueados por un factor MFA previamente registrado.
-- Los usuarios no administradores que activen MFA voluntariamente sí conservan AAL2.
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
        or exists (
          select 1
          from public.workspace_members wm
          where wm.user_id = p.user_id
            and wm.role = 'admin'
            and wm.active = true
        )
        or coalesce(auth.jwt()->>'aal','aal1') = 'aal2'
      )
  );
$$;

revoke all on function private.account_access_allowed() from public, anon, authenticated;
grant execute on function private.account_access_allowed() to authenticated;

comment on column public.profiles.mfa_required_after is
  'Campo legado. No se exige MFA administrativo; la protección 2FA es voluntaria.';
