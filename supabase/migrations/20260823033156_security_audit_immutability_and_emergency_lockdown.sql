create or replace function private.block_security_event_mutation()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if session_user in ('postgres','supabase_admin') then
    return case when tg_op = 'DELETE' then old else new end;
  end if;
  raise exception 'security_events es un registro de auditoria inmutable';
end;
$$;

drop trigger if exists security_events_immutable_trg on public.security_events;
create trigger security_events_immutable_trg
before update or delete on public.security_events
for each row execute function private.block_security_event_mutation();

revoke insert, update, delete, truncate on public.security_events from anon, authenticated;
revoke insert, update, delete, truncate on public.security_sessions from anon, authenticated;

create or replace function public.security_lockdown_other_users()
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_workspace uuid;
  v_count integer := 0;
  v_now timestamptz := now();
begin
  if not private.is_control_admin() then
    raise exception 'Solo un administrador puede ejecutar el cierre general de sesiones';
  end if;

  select wm.workspace_id
    into v_workspace
  from public.workspace_members wm
  where wm.user_id = auth.uid()
    and wm.active = true
    and wm.role = 'admin'
  order by wm.created_at
  limit 1;

  if v_workspace is null then
    raise exception 'No se encontro un espacio administrativo activo';
  end if;

  update public.profiles p
     set security_force_reauth = true,
         updated_at = v_now
   where p.user_id in (
     select wm.user_id
     from public.workspace_members wm
     where wm.workspace_id = v_workspace
       and wm.active = true
       and wm.user_id <> auth.uid()
   );
  get diagnostics v_count = row_count;

  update public.security_sessions s
     set revoked_at = coalesce(s.revoked_at, v_now),
         end_reason = coalesce(s.end_reason, 'emergency_lockdown')
   where s.workspace_id = v_workspace
     and s.user_id <> auth.uid()
     and s.ended_at is null
     and s.revoked_at is null;

  insert into public.security_events(
    workspace_id,user_id,event_type,success,severity,created_at,metadata
  ) values (
    v_workspace,auth.uid(),'emergency_lockdown',true,'critical',v_now,
    jsonb_build_object('affected_users',v_count,'actor_user_id',auth.uid())
  );

  return jsonb_build_object('ok',true,'affected_users',v_count,'executed_at',v_now);
end;
$$;

revoke all on function public.security_lockdown_other_users() from public, anon;
grant execute on function public.security_lockdown_other_users() to authenticated;
