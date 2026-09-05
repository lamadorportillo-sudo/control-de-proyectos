-- Seguridad Telegram V1
-- Un vínculo de Telegram nunca debe sobrevivir a la revocación del acceso al workspace.
-- Las Edge Functions de Telegram usan service_role después de validar el vínculo, por lo
-- que esta defensa de base de datos cierra el acceso aunque una función olvide volver a
-- consultar workspace_members en una ruta secundaria.

create or replace function private.revoke_telegram_link_when_membership_ends()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
begin
  if tg_op = 'DELETE' or (old.active is true and coalesce(new.active,false) is false) then
    update public.telegram_links
       set status = 'revoked',
           telegram_user_id = null,
           telegram_chat_id = null,
           telegram_username = null,
           telegram_first_name = null,
           telegram_last_name = null,
           link_code_hash = null,
           link_code_expires_at = null,
           verified_at = null,
           current_project_id = null,
           current_visit_id = null,
           updated_at = now()
     where workspace_id = old.workspace_id
       and user_id = old.user_id
       and status is distinct from 'revoked';
  end if;
  return case when tg_op='DELETE' then old else new end;
end;
$$;

create or replace function private.guard_telegram_link_against_inactive_membership()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
begin
  if new.status in ('pending','active')
     and not exists (
       select 1
         from public.workspace_members wm
        where wm.workspace_id = new.workspace_id
          and wm.user_id = new.user_id
          and wm.active is true
     ) then
    new.status := 'revoked';
    new.telegram_user_id := null;
    new.telegram_chat_id := null;
    new.telegram_username := null;
    new.telegram_first_name := null;
    new.telegram_last_name := null;
    new.link_code_hash := null;
    new.link_code_expires_at := null;
    new.verified_at := null;
    new.current_project_id := null;
    new.current_visit_id := null;
    new.updated_at := now();
  end if;
  return new;
end;
$$;

revoke all on function private.revoke_telegram_link_when_membership_ends() from public, anon, authenticated;
revoke all on function private.guard_telegram_link_against_inactive_membership() from public, anon, authenticated;

-- El proyecto existente ya contiene ambas tablas. Los bloques condicionales permiten
-- aplicar esta migración sin romper entornos de validación donde la integración Telegram
-- todavía no haya sido aprovisionada.
do $$
begin
  if to_regclass('public.workspace_members') is not null
     and to_regclass('public.telegram_links') is not null then
    drop trigger if exists trg_revoke_telegram_link_when_membership_ends on public.workspace_members;
    create trigger trg_revoke_telegram_link_when_membership_ends
      after update of active or delete on public.workspace_members
      for each row execute function private.revoke_telegram_link_when_membership_ends();

    drop trigger if exists trg_guard_telegram_link_against_inactive_membership on public.telegram_links;
    create trigger trg_guard_telegram_link_against_inactive_membership
      before insert or update of status, workspace_id, user_id on public.telegram_links
      for each row execute function private.guard_telegram_link_against_inactive_membership();

    -- Cierra inmediatamente cualquier vínculo activo/pending que ya haya quedado huérfano.
    update public.telegram_links tl
       set status = 'revoked',
           telegram_user_id = null,
           telegram_chat_id = null,
           telegram_username = null,
           telegram_first_name = null,
           telegram_last_name = null,
           link_code_hash = null,
           link_code_expires_at = null,
           verified_at = null,
           current_project_id = null,
           current_visit_id = null,
           updated_at = now()
     where tl.status in ('active','pending')
       and not exists (
         select 1
           from public.workspace_members wm
          where wm.workspace_id = tl.workspace_id
            and wm.user_id = tl.user_id
            and wm.active is true
       );
  end if;
end;
$$;
