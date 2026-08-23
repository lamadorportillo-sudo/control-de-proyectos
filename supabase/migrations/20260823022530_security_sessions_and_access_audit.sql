alter table public.profiles
  add column if not exists security_force_reauth boolean not null default false,
  add column if not exists last_login_at timestamptz,
  add column if not exists last_password_change_at timestamptz;

create table if not exists public.security_sessions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text,
  device_label text not null default 'Dispositivo no identificado',
  user_agent text,
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  ended_at timestamptz,
  revoked_at timestamptz,
  end_reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.security_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  email text,
  event_type text not null,
  success boolean not null default true,
  severity text not null default 'info' check (severity in ('info','warning','critical')),
  device_label text,
  user_agent text,
  session_id uuid references public.security_sessions(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists security_sessions_workspace_seen_idx on public.security_sessions(workspace_id,last_seen_at desc);
create index if not exists security_sessions_user_active_idx on public.security_sessions(user_id,ended_at,revoked_at);
create index if not exists security_events_workspace_created_idx on public.security_events(workspace_id,created_at desc);
create index if not exists security_events_type_created_idx on public.security_events(event_type,created_at desc);
create index if not exists security_events_email_created_idx on public.security_events(lower(email),created_at desc) where email is not null;

alter table public.security_sessions enable row level security;
alter table public.security_events enable row level security;

revoke all on public.security_sessions from anon, authenticated;
revoke all on public.security_events from anon, authenticated;
grant select on public.security_sessions to authenticated;
grant select on public.security_events to authenticated;

drop policy if exists security_sessions_admin_select on public.security_sessions;
create policy security_sessions_admin_select on public.security_sessions
  for select to authenticated
  using (private.is_control_admin());

drop policy if exists security_events_admin_select on public.security_events;
create policy security_events_admin_select on public.security_events
  for select to authenticated
  using (private.is_control_admin());

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
      and (
        p.must_change_password = false
        or (p.temporary_password_expires_at is not null and p.temporary_password_expires_at > now())
      )
  );
$$;

revoke all on function private.account_access_allowed() from public, anon;
grant execute on function private.account_access_allowed() to authenticated, service_role;

drop policy if exists workspaces_update_owner on public.workspaces;
create policy workspaces_update_owner on public.workspaces
  for update to authenticated
  using (created_by = auth.uid() and private.is_workspace_admin(id))
  with check (created_by = auth.uid() and private.is_workspace_admin(id));
