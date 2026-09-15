const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const read=file=>fs.readFileSync(file,'utf8');
const actions=read('project-functional-actions-v1.js');
const contractsCenter=read('contracts-center-v1.js');
const index=read('index.html');
const detail=read('project-detail-v2.js');
const payments=read('payments-center-v1.js');
const guarantees=read('guarantees-center-v1.js');
const visits=read('visits-center-v1.js');
const reports=read('reports-center-v1.js');
const alerts=read('alerts-center-v1.js');
const stable=read('stabilize-core-v1.cjs');
const progress=read('progress-separation-fix-v1.js');
const changes=read('change-order-fix-v1.js');
const chatbot=read('engineer-chatbot-v3.js');
const technical=read('technical-control-v1.js');
const build=read('build-pages.cjs');
assert.match(build,/\$\$\('\[data-tab\]'\)\.forEach/,'el constructor debe enlazar todas las pestañas del expediente');
assert.doesNotMatch(read('index.html'),/(?<!\$)\$\('\[data-tab\]'\)\.forEach/,'la página publicada no debe tratar un solo elemento como colección');
assert.match(build,/id="vStatus" disabled title="El estado se determina por las observaciones/,'el constructor debe impedir la captura manual del estado de visita');
const manifest=read('authenticated-module-manifest-v1.cjs');

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
    'project-detail-v2.js?v=20260913-detail4',
    'payments-center-v1.js?v=20260913-payments3',
    'guarantees-center-v1.js?v=20260913-guarantees2',
    'visits-center-v1.js?v=20260915-visits3',
    'reports-center-v1.js?v=20260915-reports4',
    'alerts-center-v1.js?v=20260913-alerts3'
  ]) assert.ok(stable.includes(version),'Falta versión nueva: '+version);
});


test('avance físico y órdenes de cambio usan únicamente el contrato activo',()=>{
  assert.match(progress,/const activeContract=projectId/);
  assert.match(progress,/!x\.voidedAt&&!x\.voided_at/);
  assert.match(progress,/!v\.voidedAt&&!v\.voided_at/);
  assert.doesNotMatch(progress,/A\(db\?\.contracts\)\.find\(x=>x\.projectId===p\.id\)/);
  assert.match(changes,/const activeContract=projectId/);
  assert.match(changes,/const c=p\?activeContract\(p\.id\):null/);
  assert.ok(manifest.includes("['progress-separation-fix-v1.js','20260913-progresssep2']"));
  assert.ok(manifest.includes("['change-order-fix-v1.js','20260913-changefix3']"));
});


test('el centro de contratos abre directamente la pestaña contractual',()=>{
  assert.match(contractsCenter,/view\.tab=['\"]contract['\"]/);
  assert.doesNotMatch(contractsCenter,/view\.tab=['\"]summary['\"]/);
  assert.match(contractsCenter,/Abrir contrato/);
  assert.ok(manifest.includes("['contracts-center-v1.js','20260914-step5']"));
});


test('el núcleo del expediente usa contrato activo en dashboard, acciones y render principal',()=>{
  assert.match(index,/function activeProjectContract\(projectId\)/);
  assert.match(index,/!x\.voidedAt&&!x\.voided_at/);
  assert.match(index,/const c=activeProjectContract\(p\.id\)/);
  assert.match(index,/onPick\(p,activeProjectContract\(p\.id\)\)/);
  assert.match(index,/p=>!!activeProjectContract\(p\.id\)/);
  assert.doesNotMatch(index,/db\.contracts\.find\([xc]=>[xc]\.projectId===p\.id\)/);
});

test('paneles e informes centrales excluyen registros anulados',()=>{
  assert.match(index,/db\.estimates\.filter\(e=>e\.contractId===c\.id&&!e\.voidedAt&&!e\.voided_at\)/);
  assert.ok(index.includes("db.guarantees.filter(g=>g.projectId===p.id&&!g.voidedAt&&!g.voided_at"));
  assert.match(index,/\(db\.visits\|\|\[\]\)\.filter\(v=>v\.projectId===p\.id&&!v\.voidedAt&&!v\.voided_at\)/);
  assert.ok(index.includes("db.payments.filter(x=>x.projectId===p.id&&!x.voidedAt&&!x.voided_at"));
});


test('garantías nuevas requieren un contrato activo y los movimientos financieros respetan contrato',()=>{
  assert.match(actions,/if\(!c\)return needContract\(p\)/);
  assert.ok(manifest.includes("['project-functional-actions-v1.js','20260913-actions4']"));
  assert.match(index,/function financialMovements\(p,c=null\)/);
  assert.match(index,/!x\.contractId\|\|!contract\|\|x\.contractId===contract\.id/);
  assert.match(index,/Registrar garantía['"],p=>!!activeProjectContract\(p\.id\)/);
});


test('garantías históricas no deben disparar deficiencias del contrato vigente',()=>{
  assert.match(alerts,/!x\.contractId\|\|!c\|\|x\.contractId===c\.id/);
  assert.match(reports,/!g\.contractId\|\|!contract\|\|g\.contractId===contract\.id/);
});


test('ZORDON y control técnico conservan el contrato activo del expediente',()=>{
  assert.match(chatbot,/activeContractForProject=projectId/);
  assert.match(chatbot,/c=activeContractForProject\(p\.id\)/);
  assert.match(chatbot,/Contrato activo:/);
  assert.match(chatbot,/Expediente actual:/);
  assert.match(technical,/!c\.voidedAt&&!c\.voided_at&&uuid\(c\.id\)/);
  assert.match(technical,/rows\.slice\(-1\)\[0\]\?\.id/);
  assert.ok(manifest.includes("['engineer-chatbot-v3.js','20260913-ai6']"));
  assert.ok(manifest.includes("['technical-control-v1.js','20260913-controltecnico2']"));
  assert.ok(build.includes('engineer-chatbot-v3.js?v=20260913-ai6'));
});
