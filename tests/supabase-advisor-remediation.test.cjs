const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const security=read('supabase/migrations/20260904054800_security_advisor_hardening_v1.sql');
const performance=read('supabase/migrations/20260904055200_performance_foreign_key_indexes_v1.sql');

test('la migración de seguridad cubre los avisos actuales del asesor de Supabase',()=>{
  for(const signature of [
    'public.apply_visit_photo_reload(uuid, uuid, jsonb, uuid)',
    'public.claim_visit_photo_reload_slot(uuid)',
    'public.claim_visit_photo_reload_slot_by_index(uuid, integer)'
  ]){
    assert.match(security,new RegExp(`alter function ${signature.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\s+set search_path = pg_catalog, public;`,'i'),`${signature}: falta search_path fijo`);
    assert.match(security,new RegExp(`revoke all on function ${signature.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\s+from public, anon, authenticated;`,'i'),`${signature}: falta revocar ejecución cliente`);
    assert.match(security,new RegExp(`grant execute on function ${signature.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\s+to service_role;`,'i'),`${signature}: falta acceso service_role`);
  }

  for(const signature of [
    'public.trigger_visit_photo_quality_check()',
    'public.telegram_project_search(uuid, text, integer)',
    'public.telegram_project_snapshot(uuid, uuid)'
  ]){
    assert.match(security,new RegExp(`revoke all on function ${signature.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\s+from public, anon, authenticated;`,'i'),`${signature}: sigue expuesta a clientes`);
    assert.match(security,new RegExp(`grant execute on function ${signature.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\s+to service_role;`,'i'),`${signature}: falta acceso service_role`);
  }

  for(const table of ['internal_hook_secrets','telegram_visit_photo_reloads','telegram_visit_photo_reload_items']){
    assert.match(security,new RegExp(`create policy ${table}_[a-z_]*deny_clients[\\s\\S]*?on public\\.${table}[\\s\\S]*?to anon, authenticated[\\s\\S]*?using \\(false\\)[\\s\\S]*?with check \\(false\\)`,'i'),`${table}: falta política deny-all explícita`);
    assert.match(security,new RegExp(`revoke all on table public\\.${table} from anon, authenticated;`,'i'),`${table}: faltan revocaciones cliente`);
  }
});

test('la migración de rendimiento cubre las 35 llaves foráneas sin índice reportadas',()=>{
  const expected=[
    ['environmental_social_records','created_by'],['environmental_social_records','project_id'],['environmental_social_records','updated_by'],['environmental_social_records','visit_id'],
    ['project_admin_acts','contract_id'],['project_admin_acts','created_by'],['project_admin_acts','project_id'],['project_admin_acts','updated_by'],
    ['project_receptions','contract_id'],['project_receptions','created_by'],['project_receptions','project_id'],['project_receptions','updated_by'],
    ['quality_tests','contract_id'],['quality_tests','created_by'],['quality_tests','project_id'],['quality_tests','updated_by'],['quality_tests','visit_id'],
    ['risk_claims','contract_id'],['risk_claims','created_by'],['risk_claims','project_id'],['risk_claims','updated_by'],
    ['safety_records','created_by'],['safety_records','project_id'],['safety_records','updated_by'],['safety_records','visit_id'],
    ['site_daily_logs','created_by'],['site_daily_logs','project_id'],['site_daily_logs','updated_by'],['site_daily_logs','visit_id'],
    ['technical_queries','contract_id'],['technical_queries','created_by'],['technical_queries','project_id'],['technical_queries','updated_by'],
    ['telegram_visit_photo_reload_items','evidence_id'],['telegram_visit_photo_reloads','project_id']
  ];
  assert.equal(expected.length,35);
  for(const [table,column] of expected){
    const index=`${table}_${column}_idx`;
    const pattern=new RegExp(`create index if not exists ${index} on public\\.${table}\\(${column}\\);`,'i');
    assert.match(performance,pattern,`${table}.${column}: falta índice de cobertura`);
  }
});

test('las migraciones de asesor están ordenadas después de la restauración de MFA',()=>{
  const files=fs.readdirSync(path.join(root,'supabase/migrations')).filter(x=>x.endsWith('.sql')).sort();
  const mfa=files.indexOf('20260904054000_security_admin_mfa_mandatory_restore_v1.sql');
  const sec=files.indexOf('20260904054800_security_advisor_hardening_v1.sql');
  const perf=files.indexOf('20260904055200_performance_foreign_key_indexes_v1.sql');
  assert.ok(mfa>=0&&sec>mfa&&perf>sec,'el orden de migraciones no preserva MFA -> seguridad -> rendimiento');
});
