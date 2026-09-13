const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const read=file=>fs.readFileSync(file,'utf8');
const actions=read('project-functional-actions-v1.js');
const detail=read('project-detail-v2.js');
const payments=read('payments-center-v1.js');
const guarantees=read('guarantees-center-v1.js');
const visits=read('visits-center-v1.js');
const reports=read('reports-center-v1.js');
const alerts=read('alerts-center-v1.js');
const stable=read('stabilize-core-v1.cjs');

test('las acciones del expediente y el resumen ignoran contratos anulados',()=>{
  assert.match(actions,/!x\.voidedAt&&!x\.voided_at/);
  assert.match(actions,/slice\(-1\)\[0\]\|\|null/);
  assert.match(detail,/!x\.voidedAt&&!x\.voided_at/);
  assert.doesNotMatch(actions,/find\(x=>x\.projectId===p\.id\)/);
  assert.doesNotMatch(detail,/find\(x=>x\.projectId===p\.id\)/);
});

test('pagos permite consultar por selector de proyecto sin obligar a escribir búsqueda',()=>{
  assert.match(payments,/function filteredRows\(rows\)/);
  assert.match(payments,/hasFilters\(\)/);
  assert.match(payments,/ST\.project!==['"]all['"]/);
  assert.doesNotMatch(payments,/if\(!q\)return \[\]/);
  assert.match(payments,/data-cpf-awaiting="\$\{hasFilters\(\)\?'0':'1'\}"/);
});

test('visitas, garantías e informes conservan la relación contractual real',()=>{
  assert.match(visits,/contractFor\(contracts,project\.id,v\.contractId\)/);
  assert.match(guarantees,/contractFor\(cs,g\.projectId,g\.contractId\)/);
  assert.match(reports,/activeContract\(d\.contracts,project\.id\)/);
  assert.match(reports,/!e\.voidedAt&&!e\.voided_at/);
  assert.match(reports,/!v\.voidedAt&&!v\.voided_at/);
  assert.match(reports,/!g\.voidedAt&&!g\.voided_at/);
});

test('deficiencias abre el registro sobre el contrato vinculado y usa fecha Honduras',()=>{
  assert.match(alerts,/America\/Tegucigalpa/);
  assert.match(alerts,/contractFor\(contracts,p\.id\)/);
  assert.match(alerts,/contractFor\(d\.contracts,p\.id,g\.contractId\)/);
  assert.match(alerts,/contractFor\(d\.contracts,p\.id,e\.contractId\)/);
  assert.match(alerts,/contractFor\(d\.contracts,p\.id,v\.contractId\)/);
  assert.doesNotMatch(alerts,/new Date\(\)\.toISOString\(\)\.slice\(0,10\)/);
});

test('el cargador autenticado invalida caché de los módulos corregidos',()=>{
  for(const version of [
    'project-detail-v2.js?v=20260913-detail3',
    'payments-center-v1.js?v=20260913-payments2',
    'guarantees-center-v1.js?v=20260913-guarantees2',
    'visits-center-v1.js?v=20260913-visits2',
    'reports-center-v1.js?v=20260913-reports2',
    'alerts-center-v1.js?v=20260913-alerts2'
  ]) assert.ok(stable.includes(version),'Falta versión nueva: '+version);
});
