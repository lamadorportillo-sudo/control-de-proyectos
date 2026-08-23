create or replace function public.service_user_has_verified_mfa(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = auth, pg_temp
as $$
  select exists (
    select 1
    from auth.mfa_factors f
    where f.user_id = p_user_id
      and f.status = 'verified'
  );
$$;

revoke all on function public.service_user_has_verified_mfa(uuid) from public, anon, authenticated;
grant execute on function public.service_user_has_verified_mfa(uuid) to service_role;
