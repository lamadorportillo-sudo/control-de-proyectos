-- Endurecimiento derivado de la auditoría del asesor de seguridad de Supabase.
-- Esta migración mantiene los flujos internos existentes, pero elimina exposición
-- innecesaria de funciones de mantenimiento y documenta tablas de uso exclusivo
-- del backend mediante políticas deny-all para clientes.

-- 1) Funciones internas de recarga fotográfica.
-- Se ejecutan desde Edge Functions con service_role; no deben exponerse por RPC
-- a usuarios anónimos ni autenticados. Además se fija search_path explícitamente.
alter function public.apply_visit_photo_reload(uuid, uuid, jsonb, uuid)
  set search_path = pg_catalog, public;
revoke all on function public.apply_visit_photo_reload(uuid, uuid, jsonb, uuid)
  from public, anon, authenticated;
grant execute on function public.apply_visit_photo_reload(uuid, uuid, jsonb, uuid)
  to service_role;

alter function public.claim_visit_photo_reload_slot(uuid)
  set search_path = pg_catalog, public;
revoke all on function public.claim_visit_photo_reload_slot(uuid)
  from public, anon, authenticated;
grant execute on function public.claim_visit_photo_reload_slot(uuid)
  to service_role;

alter function public.claim_visit_photo_reload_slot_by_index(uuid, integer)
  set search_path = pg_catalog, public;
revoke all on function public.claim_visit_photo_reload_slot_by_index(uuid, integer)
  from public, anon, authenticated;
grant execute on function public.claim_visit_photo_reload_slot_by_index(uuid, integer)
  to service_role;

-- 2) La función de trigger usa SECURITY DEFINER para leer el secreto interno.
-- Un trigger no necesita que los roles cliente puedan invocarlo directamente.
revoke all on function public.trigger_visit_photo_quality_check()
  from public, anon, authenticated;
grant execute on function public.trigger_visit_photo_quality_check()
  to service_role;

-- 3) Búsqueda y snapshot de proyectos de Telegram.
-- El router de Telegram utiliza un cliente service_role. Conservamos la defensa
-- interna por workspace y retiramos la ejecución directa desde PostgREST para
-- usuarios autenticados, reduciendo la superficie SECURITY DEFINER expuesta.
revoke all on function public.telegram_project_search(uuid, text, integer)
  from public, anon, authenticated;
grant execute on function public.telegram_project_search(uuid, text, integer)
  to service_role;

revoke all on function public.telegram_project_snapshot(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.telegram_project_snapshot(uuid, uuid)
  to service_role;

-- 4) Tablas deliberadamente internas. RLS sin políticas ya equivale a deny-all,
-- pero las políticas explícitas dejan la intención verificable y eliminan la
-- ambigüedad señalada por el asesor.
drop policy if exists internal_hook_secrets_deny_clients on public.internal_hook_secrets;
create policy internal_hook_secrets_deny_clients
on public.internal_hook_secrets
for all
to anon, authenticated
using (false)
with check (false);

revoke all on table public.internal_hook_secrets from anon, authenticated;


drop policy if exists telegram_visit_photo_reloads_deny_clients on public.telegram_visit_photo_reloads;
create policy telegram_visit_photo_reloads_deny_clients
on public.telegram_visit_photo_reloads
for all
to anon, authenticated
using (false)
with check (false);

revoke all on table public.telegram_visit_photo_reloads from anon, authenticated;


drop policy if exists telegram_visit_photo_reload_items_deny_clients on public.telegram_visit_photo_reload_items;
create policy telegram_visit_photo_reload_items_deny_clients
on public.telegram_visit_photo_reload_items
for all
to anon, authenticated
using (false)
with check (false);

revoke all on table public.telegram_visit_photo_reload_items from anon, authenticated;

comment on policy internal_hook_secrets_deny_clients on public.internal_hook_secrets is
  'Tabla interna: solo procesos privilegiados del backend pueden consultar secretos de hooks.';
comment on policy telegram_visit_photo_reloads_deny_clients on public.telegram_visit_photo_reloads is
  'Estado interno de recarga fotográfica; clientes web no acceden directamente.';
comment on policy telegram_visit_photo_reload_items_deny_clients on public.telegram_visit_photo_reload_items is
  'Ítems internos de recarga fotográfica; clientes web no acceden directamente.';
