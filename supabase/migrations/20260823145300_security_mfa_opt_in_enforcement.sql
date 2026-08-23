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
  );
$$;
