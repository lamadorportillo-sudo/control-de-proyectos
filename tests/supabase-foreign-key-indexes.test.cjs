const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'supabase/migrations/20260904055200_performance_foreign_key_indexes_v1.sql'),'utf8');
const normalized=source.replace(/\s+/g,' ').toLowerCase();

const expected={
  environmental_social_records:['created_by','project_id','updated_by','visit_id'],
  project_admin_acts:['contract_id','created_by','project_id','updated_by'],
  project_receptions:['contract_id','created_by','project_id','updated_by'],
  quality_tests:['contract_id','created_by','project_id','updated_by','visit_id'],
  risk_claims:['contract_id','created_by','project_id','updated_by'],
  safety_records:['created_by','project_id','updated_by','visit_id'],
  site_daily_logs:['created_by','project_id','updated_by','visit_id'],
  technical_queries:['contract_id','created_by','project_id','updated_by'],
  telegram_visit_photo_reload_items:['evidence_id'],
  telegram_visit_photo_reloads:['project_id'],
};

test('todas las llaves foráneas reportadas por el asesor tienen índice de cobertura',()=>{
  let count=0;
  for(const [table,columns] of Object.entries(expected)){
    for(const column of columns){
      count++;
      const indexName=`${table}_${column}_idx`;
      assert.ok(normalized.includes(`create index if not exists ${indexName} on public.${table}(${column})`),`${table}.${column} debe quedar indexada`);
    }
  }
  assert.equal(count,35);
});

test('la migración no elimina índices existentes basándose solo en métricas de poco uso',()=>{
  assert.doesNotMatch(source,/\bdrop\s+index\b/i);
});
