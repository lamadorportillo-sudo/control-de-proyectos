create index if not exists security_events_session_id_idx
  on public.security_events(session_id)
  where session_id is not null;

create index if not exists security_events_user_id_created_idx
  on public.security_events(user_id, created_at desc)
  where user_id is not null;

drop policy if exists workspace_invites_admin_insert on public.workspace_invites;
create policy workspace_invites_admin_insert
on public.workspace_invites
for insert
to authenticated
with check (
  private.is_workspace_admin(workspace_id)
  and created_by = (select auth.uid())
);

drop policy if exists workspaces_update_owner on public.workspaces;
create policy workspaces_update_owner
on public.workspaces
for update
to authenticated
using (
  created_by = (select auth.uid())
  and private.is_workspace_admin(id)
)
with check (
  created_by = (select auth.uid())
  and private.is_workspace_admin(id)
);
