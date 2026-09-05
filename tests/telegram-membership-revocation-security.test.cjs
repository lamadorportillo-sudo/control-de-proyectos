const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const migration=fs.readFileSync('supabase/migrations/20260905101500_telegram_membership_revocation_guard_v1.sql','utf8');

test('revocar un miembro del workspace revoca también su vínculo Telegram',()=>{
  assert.match(migration,/create or replace function private\.revoke_telegram_link_when_membership_ends\(\)/i);
  assert.match(migration,/tg_op = 'DELETE'|tg_op='DELETE'/i);
  assert.match(migration,/old\.active is true[\s\S]*new\.active,false/i,'debe detectar el paso de miembro activo a inactivo');
  assert.match(migration,/update public\.telegram_links[\s\S]*status = 'revoked'/i,'debe invalidar el vínculo Telegram');
  for(const field of ['telegram_user_id','telegram_chat_id','link_code_hash','link_code_expires_at','verified_at','current_project_id','current_visit_id']){
    assert.match(migration,new RegExp(`${field}\\s*=\\s*null`,'i'),`debe limpiar ${field}`);
  }
  assert.match(migration,/after update of active or delete on public\.workspace_members/i,'el trigger debe cubrir desactivación y borrado');
});

test('ningún vínculo pending/active puede existir sin membresía activa',()=>{
  assert.match(migration,/create or replace function private\.guard_telegram_link_against_inactive_membership\(\)/i);
  assert.match(migration,/new\.status in \('pending','active'\)/i);
  assert.match(migration,/from public\.workspace_members wm[\s\S]*wm\.workspace_id = new\.workspace_id[\s\S]*wm\.user_id = new\.user_id[\s\S]*wm\.active is true/i);
  assert.match(migration,/before insert or update of status, workspace_id, user_id on public\.telegram_links/i);
  assert.match(migration,/where tl\.status in \('active','pending'\)[\s\S]*not exists/i,'la migración debe revocar enlaces huérfanos existentes');
});

test('las funciones de seguridad Telegram no quedan ejecutables por clientes normales',()=>{
  assert.match(migration,/revoke all on function private\.revoke_telegram_link_when_membership_ends\(\) from public, anon, authenticated/i);
  assert.match(migration,/revoke all on function private\.guard_telegram_link_against_inactive_membership\(\) from public, anon, authenticated/i);
  assert.match(migration,/security definer[\s\S]*set search_path = pg_catalog, public, private/i,'las funciones SECURITY DEFINER deben fijar search_path');
});
