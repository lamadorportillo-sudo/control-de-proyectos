const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const migration=fs.readFileSync(path.join(root,'supabase/migrations/20260904054800_security_advisor_hardening_v1.sql'),'utf8');

const compact=s=>s.replace(/\s+/g,' ').trim().toLowerCase();
const sql=compact(migration);

test('las funciones internas de recarga fijan search_path y quedan solo para service_role',()=>{
  for(const signature of [
    'public.apply_visit_photo_reload(uuid, uuid, jsonb, uuid)',
    'public.claim_visit_photo_reload_slot(uuid)',
    'public.claim_visit_photo_reload_slot_by_index(uuid, integer)'
  ]){
    assert.ok(sql.includes(`alter function ${signature} set search_path = pg_catalog, public`),`${signature} debe fijar search_path`);
    assert.ok(sql.includes(`revoke all on function ${signature} from public, anon, authenticated`),`${signature} no debe exponerse a clientes`);
    assert.ok(sql.includes(`grant execute on function ${signature} to service_role`),`${signature} debe seguir disponible para Edge Functions internas`);
  }
});

test('el trigger privilegiado no puede invocarse directamente desde PostgREST',()=>{
  assert.ok(sql.includes('revoke all on function public.trigger_visit_photo_quality_check() from public, anon, authenticated'));
  assert.ok(sql.includes('grant execute on function public.trigger_visit_photo_quality_check() to service_role'));
});

test('los RPC SECURITY DEFINER de Telegram quedan reservados al router service_role',()=>{
  for(const signature of [
    'public.telegram_project_search(uuid, text, integer)',
    'public.telegram_project_snapshot(uuid, uuid)'
  ]){
    assert.ok(sql.includes(`revoke all on function ${signature} from public, anon, authenticated`),`${signature} no debe exponerse a authenticated`);
    assert.ok(sql.includes(`grant execute on function ${signature} to service_role`),`${signature} debe conservar acceso interno`);
  }
});

test('las tablas internas declaran una política deny-all explícita para clientes',()=>{
  for(const table of ['internal_hook_secrets','telegram_visit_photo_reloads','telegram_visit_photo_reload_items']){
    assert.match(migration,new RegExp(`create policy ${table}_[a-z_]*deny_clients[\\s\\S]*?on public\\.${table}[\\s\\S]*?to anon, authenticated[\\s\\S]*?using \\(false\\)[\\s\\S]*?with check \\(false\\)`,'i'),`${table} debe expresar deny-all`);
    assert.ok(sql.includes(`revoke all on table public.${table} from anon, authenticated`),`${table} debe revocar grants cliente`);
  }
});
