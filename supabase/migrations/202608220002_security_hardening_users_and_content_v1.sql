-- Seguridad de usuarios, permisos y contenido privado.
-- Aplicada en Supabase como security_hardening_users_and_content_v1.

create or replace function private.account_access_allowed()
returns boolean
language sql
stable
security definer
set search_path to 'public','pg_temp'
as $$
  select exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.active = true
      and (
        p.must_change_password = false
        or (p.temporary_password_expires_at is not null and p.temporary_password_expires_at > now())
      )
  );
$$;

revoke all on function private.account_access_allowed() from public, anon;
grant execute on function private.account_access_allowed() to authenticated;

create or replace function private.is_workspace_member(p_workspace_id uuid)
returns boolean language sql stable security definer set search_path to 'public','pg_temp'
as $$
  select private.account_access_allowed()
     and exists (
       select 1 from public.workspace_members wm
       where wm.workspace_id=p_workspace_id and wm.user_id=auth.uid() and wm.active=true
     );
$$;

create or replace function private.can_edit_workspace(p_workspace_id uuid)
returns boolean language sql stable security definer set search_path to 'public','pg_temp'
as $$
  select private.account_access_allowed()
     and exists (
       select 1 from public.workspace_members wm
       where wm.workspace_id=p_workspace_id and wm.user_id=auth.uid() and wm.active=true
         and wm.role in ('admin','editor')
     );
$$;

create or replace function private.is_workspace_admin(p_workspace_id uuid)
returns boolean language sql stable security definer set search_path to 'public','pg_temp'
as $$
  select private.account_access_allowed()
     and exists (
       select 1 from public.workspace_members wm
       where wm.workspace_id=p_workspace_id and wm.user_id=auth.uid() and wm.active=true and wm.role='admin'
     );
$$;

create or replace function private.is_control_admin()
returns boolean language sql stable security definer set search_path to 'public','private','pg_temp'
as $$
  select private.account_access_allowed()
     and exists (
       select 1 from public.workspace_members wm
       where wm.user_id=auth.uid() and wm.active=true and wm.role='admin'
     );
$$;

revoke all on function private.is_workspace_member(uuid) from public, anon;
revoke all on function private.can_edit_workspace(uuid) from public, anon;
revoke all on function private.is_workspace_admin(uuid) from public, anon;
revoke all on function private.is_control_admin() from public, anon;
grant execute on function private.is_workspace_member(uuid) to authenticated;
grant execute on function private.can_edit_workspace(uuid) to authenticated;
grant execute on function private.is_workspace_admin(uuid) to authenticated;
grant execute on function private.is_control_admin() to authenticated;

drop policy if exists app_state_select_member on public.app_state;
create policy app_state_select_member on public.app_state for select to authenticated
using (private.is_workspace_member(workspace_id));

drop policy if exists workspaces_select_member on public.workspaces;
create policy workspaces_select_member on public.workspaces for select to authenticated
using (private.is_workspace_member(id));

-- El usuario solo puede modificar su nombre visible. No puede reactivarse ni quitarse
-- el cambio obligatorio de contraseña desde REST.
revoke insert, delete, truncate, references, trigger on public.profiles from authenticated;
revoke update on public.profiles from authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, updated_at) on public.profiles to authenticated;

revoke all on public.workspace_members from anon;
revoke insert, update, delete, truncate, references, trigger on public.workspace_members from authenticated;
grant select on public.workspace_members to authenticated;

revoke all on public.workspace_invites from anon;
revoke all on public.workspace_invites from authenticated;
grant select on public.workspace_invites to authenticated;
grant insert (workspace_id, invite_code, role, created_by, expires_at, requested_email, access_request_id)
  on public.workspace_invites to authenticated;

revoke all on public.access_requests from anon;
revoke all on public.access_requests from authenticated;
grant select on public.access_requests to authenticated;
grant update (status, reviewed_at, reviewed_by, invite_id) on public.access_requests to authenticated;

drop policy if exists access_requests_admin_update on public.access_requests;
create policy access_requests_admin_update on public.access_requests for update to authenticated
using (private.is_control_admin()) with check (private.is_control_admin());

drop policy if exists workspace_invites_admin_insert on public.workspace_invites;
create policy workspace_invites_admin_insert on public.workspace_invites for insert to authenticated
with check (private.is_workspace_admin(workspace_id) and created_by=auth.uid());

-- RPC administrativos bajo privilegios del usuario y RLS, sin SECURITY DEFINER público.
create or replace function public.approve_access_request(p_request_id uuid, p_days integer default 3)
returns table(invite_code text, expires_at timestamptz, email text, role text)
language plpgsql security invoker set search_path to 'public','private','pg_temp'
as $$
declare
  v_req public.access_requests%rowtype; v_workspace uuid; v_code text; v_exp timestamptz; v_invite uuid;
begin
  if not private.is_control_admin() then raise exception 'SOLO_ADMINISTRADOR'; end if;
  select wm.workspace_id into v_workspace from public.workspace_members wm
   where wm.user_id=auth.uid() and wm.active=true and wm.role='admin' order by wm.created_at limit 1;
  if v_workspace is null then raise exception 'SOLO_ADMINISTRADOR'; end if;
  select ar.* into v_req from public.access_requests ar where ar.id=p_request_id for update;
  if not found then raise exception 'SOLICITUD_NO_ENCONTRADA'; end if;
  if v_req.status not in ('pending','approved') then raise exception 'SOLICITUD_NO_DISPONIBLE'; end if;
  if v_req.invite_id is not null then
    return query select wi.invite_code,wi.expires_at,v_req.email,wi.role from public.workspace_invites wi where wi.id=v_req.invite_id;
    return;
  end if;
  v_code:=upper(substr(replace(gen_random_uuid()::text,'-',''),1,12));
  v_exp:=now()+make_interval(days=>greatest(1,least(coalesce(p_days,3),14)));
  insert into public.workspace_invites(workspace_id,invite_code,role,created_by,expires_at,requested_email,access_request_id)
   values(v_workspace,v_code,v_req.requested_role,auth.uid(),v_exp,lower(v_req.email),v_req.id) returning id into v_invite;
  update public.access_requests set status='approved',reviewed_at=now(),reviewed_by=auth.uid(),invite_id=v_invite where id=v_req.id;
  return query select v_code,v_exp,v_req.email,v_req.requested_role;
end;
$$;

create or replace function public.reject_access_request(p_request_id uuid)
returns void language plpgsql security invoker set search_path to 'public','private','pg_temp'
as $$
begin
  if not private.is_control_admin() then raise exception 'SOLO_ADMINISTRADOR'; end if;
  update public.access_requests set status='rejected',reviewed_at=now(),reviewed_by=auth.uid()
   where id=p_request_id and status='pending';
end;
$$;

create or replace function public.create_workspace_invite(p_role text default 'consulta', p_days integer default 7)
returns table(invite_code text, expires_at timestamptz, role text)
language plpgsql security invoker set search_path to 'public','private','pg_temp'
as $$
declare v_workspace uuid; v_code text; v_exp timestamptz;
begin
  select wm.workspace_id into v_workspace from public.workspace_members wm
   where wm.user_id=auth.uid() and wm.active=true and wm.role='admin' order by wm.created_at nulls last limit 1;
  if v_workspace is null or not private.is_workspace_admin(v_workspace) then raise exception 'SOLO_ADMINISTRADOR'; end if;
  if p_role not in ('editor','consulta') then raise exception 'ROL_NO_VALIDO'; end if;
  v_code:=upper(substr(replace(gen_random_uuid()::text,'-',''),1,12));
  v_exp:=now()+make_interval(days=>greatest(1,least(coalesce(p_days,7),30)));
  insert into public.workspace_invites(workspace_id,invite_code,role,created_by,expires_at)
   values(v_workspace,v_code,p_role,auth.uid(),v_exp);
  return query select v_code,v_exp,p_role;
end;
$$;

revoke all on function public.approve_access_request(uuid,integer) from public, anon;
revoke all on function public.reject_access_request(uuid) from public, anon;
revoke all on function public.create_workspace_invite(text,integer) from public, anon;
grant execute on function public.approve_access_request(uuid,integer) to authenticated;
grant execute on function public.reject_access_request(uuid) to authenticated;
grant execute on function public.create_workspace_invite(text,integer) to authenticated;
revoke all on function private.approve_access_request_impl(uuid,integer) from public, anon, authenticated;
revoke all on function private.reject_access_request_impl(uuid) from public, anon, authenticated;
revoke all on function private.create_workspace_invite_impl(text,integer) from public, anon, authenticated;

-- Archivos: bucket privado, lectura solo para miembros activos y escritura solo para editor/admin.
drop policy if exists project_files_read on storage.objects;
create policy project_files_read on storage.objects for select to authenticated
using (bucket_id='project-files' and split_part(name,'/',1) ~* '^[0-9a-f-]{36}$'
       and private.is_workspace_member(split_part(name,'/',1)::uuid));

drop policy if exists project_files_insert on storage.objects;
create policy project_files_insert on storage.objects for insert to authenticated
with check (bucket_id='project-files' and split_part(name,'/',1) ~* '^[0-9a-f-]{36}$'
            and private.can_edit_workspace(split_part(name,'/',1)::uuid));

drop policy if exists project_files_update on storage.objects;
create policy project_files_update on storage.objects for update to authenticated
using (bucket_id='project-files' and split_part(name,'/',1) ~* '^[0-9a-f-]{36}$'
       and private.can_edit_workspace(split_part(name,'/',1)::uuid))
with check (bucket_id='project-files' and split_part(name,'/',1) ~* '^[0-9a-f-]{36}$'
            and private.can_edit_workspace(split_part(name,'/',1)::uuid));

drop policy if exists project_files_delete on storage.objects;
create policy project_files_delete on storage.objects for delete to authenticated
using (bucket_id='project-files' and split_part(name,'/',1) ~* '^[0-9a-f-]{36}$'
       and private.can_edit_workspace(split_part(name,'/',1)::uuid));

update storage.buckets set public=false,file_size_limit=26214400,
 allowed_mime_types=array['application/pdf','image/jpeg','image/png','image/webp',
 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.ms-excel',
 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']::text[]
where id='project-files';
